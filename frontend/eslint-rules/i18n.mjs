const fixed = new Set(["CTRL.Z", "MB", "PDF", "FA", "EN"]);
const readable = (text) =>
  /[a-zA-Z\u0600-\u06ff]/.test(text) && !fixed.has(text.trim());
const rule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      translate:
        "Keep UI copy in the central dictionary and render it through t().",
    },
  },
  create(context) {
    return {
      JSXText(node) {
        if (readable(node.value.trim()))
          context.report({ node, messageId: "translate" });
      },
      JSXAttribute(node) {
        if (
          ["placeholder", "title", "aria-label"].includes(node.name.name) &&
          node.value?.type === "Literal" &&
          typeof node.value.value === "string" &&
          readable(node.value.value)
        )
          context.report({ node, messageId: "translate" });
      },
    };
  },
};
export default rule;
