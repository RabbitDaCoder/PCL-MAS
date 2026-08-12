// Use-case: preview a unique join code for the create-class wizard's Class Settings step —
// before the class exists, so the lecturer can see/copy/regenerate it prior to submitting.
const {
  generateClassCode: generateRandomCode,
} = require("../../utils/classCode");

async function generateClassCode({ classRepository }) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateRandomCode();
    // eslint-disable-next-line no-await-in-loop
    const existing = await classRepository.findByClassCode(code);
    if (!existing) return { classCode: code };
  }
  throw new Error("Could not generate a unique class code.");
}

module.exports = generateClassCode;
