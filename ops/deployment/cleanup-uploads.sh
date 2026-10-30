#!/usr/bin/env bash
# Installed as /usr/local/sbin/ctrlz-cleanup-uploads (root-owned).
source /srv/ctrlz/current/ops/deployment/common.sh
lock_deployment
# Never call cleanup_uploads here or touch persistent media. A scheduled
# retention policy for persistent orphan assets needs separate owner approval.
# A hard process stop can skip finally blocks. The upload deadline is 65 minutes;
# only identified PRIVATE TEMPORARY upload files older than two hours are reclaimed.
dc exec -T frontend node -e '
const fs=require("node:fs/promises"), path=require("node:path");
(async()=>{for(const name of await fs.readdir("/tmp")){
 if(!/^ctrlz-upload-[A-Za-z0-9_-]+$/.test(name))continue;
 const p=path.join("/tmp",name), s=await fs.lstat(p);
 if(s.isDirectory() && !s.isSymbolicLink() && s.mtimeMs<Date.now()-7200000)
   await fs.rm(p,{recursive:true,force:true});
}})().catch(e=>{console.error(e.message);process.exit(1)});'
dc exec -T backend python -c '
import pathlib,time,tempfile
for p in pathlib.Path(tempfile.gettempdir()).glob("*.upload*"):
    if not p.is_symlink() and p.is_file() and p.stat().st_mtime < time.time()-7200:
        p.unlink()
'
