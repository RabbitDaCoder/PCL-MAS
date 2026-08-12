// Generates short, human-typeable class join codes — excludes visually ambiguous characters
// (0/O, 1/I) so students can type them without confusion.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateClassCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

module.exports = { generateClassCode };
