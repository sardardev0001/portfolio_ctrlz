"""Real HTTPS integration checks. Uses disposable assets, never existing media.

Run small checks from the development computer; --large on the capacity-checked
VPS exercises the same public HTTPS ingress without a GiB Internet transfer.
Credentials are read from a private file, never command-line arguments or logs.
"""
import argparse
import hashlib
import http.client
import http.cookiejar
import json
import ssl
import struct
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--origin', required=True)
parser.add_argument('--password-file', type=Path, required=True)
parser.add_argument('--fixtures', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--large', action='store_true')
args = parser.parse_args()
origin = urllib.parse.urlsplit(args.origin)
assert origin.scheme == 'https' and not origin.path.strip('/')
context = ssl.create_default_context()
jar = http.cookiejar.CookieJar()
client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar), urllib.request.HTTPSHandler(context=context))
csrf = ''
results = []

def api(path, method='GET', data=None):
    body = json.dumps(data).encode() if data is not None else None
    request = urllib.request.Request(args.origin+path, data=body, method=method,
        headers={'Origin': args.origin, 'X-CSRFToken': csrf, **({'Content-Type':'application/json'} if body else {})})
    with client.open(request, timeout=90) as response:
        raw = response.read()
        return json.loads(raw)['data'] if raw else None

csrf = api('/api/v1/auth/csrf/')['csrf_token']
challenge = api('/api/v1/auth/challenge/')
answer = challenge['left']+challenge['right'] if challenge['operator']=='+' else challenge['left']-challenge['right']
api('/api/v1/auth/login/', 'POST', {'username':'ctrlz-admin','password':args.password_file.read_text().strip(),
    'challenge_id':challenge['challenge_id'],'challenge_answer':answer})
csrf = api('/api/v1/auth/csrf/')['csrf_token']

def upload(path, mime='video/mp4', cancel=False):
    boundary = 'ctrlz-test-'+uuid.uuid4().hex
    start = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\nContent-Type: {mime}\r\n\r\n').encode()
    end = f'\r\n--{boundary}--\r\n'.encode()
    connection = http.client.HTTPSConnection(origin.hostname, origin.port or 443, context=context, timeout=3900)
    connection.putrequest('POST','/api/v1/admin/media/')
    for key, value in {'Origin':args.origin,'X-CSRFToken':csrf,
        'Cookie':'; '.join(f'{c.name}={c.value}' for c in jar),
        'Content-Type':f'multipart/form-data; boundary={boundary}',
        'Content-Length':str(len(start)+path.stat().st_size+len(end))}.items():
        connection.putheader(key, value)
    connection.endheaders();connection.send(start)
    with path.open('rb') as source:
        while True:
            chunk = source.read(262144)
            if not chunk: break
            connection.send(chunk)
            if cancel:
                connection.close(); return None, None
    connection.send(end)
    response = connection.getresponse(); status = response.status; raw = response.read()
    connection.close()
    return status, json.loads(raw)

def record(name, **details):
    results.append({'name':name,**details});print('PASS: '+name,flush=True)
    args.output.write_text(json.dumps({'origin':args.origin,'large_client':'VPS public HTTPS ingress' if args.large else 'external development computer','checks':results},indent=2))

for name, expected in [('short.mp4',201),('too-long.mp4',422),('corrupt.mp4',422)]:
    status, data = upload(args.fixtures/name)
    assert status==expected,(name,status,data)
    if status==201:
        asset=data['data']; assert 0 < asset['duration_seconds'] < 1
        api(f"/api/v1/admin/media/{asset['id']}/",'DELETE')
    record(name, status=status)

status, data=upload(args.fixtures/'pixel.png','image/png')
assert status==201,(status,data)
asset=data['data']
category=api('/api/v1/admin/categories/')[0]['id']
image_project=api('/api/v1/admin/projects/','POST',{'title':'Disposable image verification',
    'slug':'image-check-'+uuid.uuid4().hex[:12], 'category':category,'status':'published','thumbnail_asset':asset['id']})
with urllib.request.urlopen(args.origin+f"/api/v1/media/{asset['id']}/",context=context,timeout=30) as r:
    assert r.read()==(args.fixtures/'pixel.png').read_bytes()
api(f"/api/v1/admin/projects/{image_project['id']}/",'DELETE')
api(f"/api/v1/admin/media/{asset['id']}/",'DELETE')
record('image upload and public download')

if args.large:
    for seconds, size in [(30,100_000_000),(90,900_000_000),(120,1073741824),(120,1073741825)]:
        source=args.fixtures/f'{seconds}.mp4'
        target=args.fixtures/'boundary.mp4'
        # A real H.264 MP4 with a standards-compliant unused free atom.
        target.write_bytes(source.read_bytes())
        remaining=size-target.stat().st_size
        with target.open('ab') as f:
            f.write(struct.pack('>I4s',remaining,b'free')); f.truncate(size)
        started=time.monotonic();status,data=upload(target)
        expected=413 if size>1073741824 else 201
        assert status==expected,(seconds,size,status,data)
        if status==201:
            asset=data['data'];assert asset['size']==size and asset['duration_seconds']==seconds
            connection=http.client.HTTPSConnection(origin.hostname,context=context,timeout=60)
            connection.request('GET',f"/api/v1/media/{asset['id']}/",headers={'Range':'bytes=0-63',
                'Cookie':'; '.join(f'{c.name}={c.value}' for c in jar)})
            response=connection.getresponse(); assert response.status==206 and len(response.read())==64
            connection.close()
            if size==1073741824:
                category=api('/api/v1/admin/categories/')[0]['id']
                project=api('/api/v1/admin/projects/','POST',{'title':'Deployment persistence test','slug':'deploy-check-'+uuid.uuid4().hex[:12],
                    'category':category,'status':'draft','video_asset':asset['id']})
                digest=hashlib.sha256()
                with target.open('rb') as f:
                    while True:
                        chunk=f.read(1024*1024)
                        if not chunk:break
                        digest.update(chunk)
                (args.fixtures/'persistence.json').write_text(json.dumps({'asset_id':asset['id'],'project_id':project['id'],
                    'sha256':digest.hexdigest(),'size':size,'duration':seconds}))
            else:
                api(f"/api/v1/admin/media/{asset['id']}/",'DELETE')
        record(f'{size} bytes / {seconds}s',status=status,seconds_elapsed=round(time.monotonic()-started,2))
    before=api('/api/v1/admin/media/')
    upload(args.fixtures/'boundary.mp4',cancel=True)
    time.sleep(3)
    assert api('/api/v1/admin/media/')==before
    record('cancelled partial upload creates no media record')
api('/api/v1/auth/logout/','POST')
