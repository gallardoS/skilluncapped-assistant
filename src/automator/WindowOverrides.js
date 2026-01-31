// Suppress annoying alerts/confirms/prompts
window.alert = function () { console.log("SkillUncapped Assistant: Alert suppressed"); return true; };
window.confirm = function () { console.log("SkillUncapped Assistant: Confirm suppressed"); return true; };
window.prompt = function () { console.log("SkillUncapped Assistant: Prompt suppressed"); return null; };
