exports.formatBankName = value => {
  if (!value) return value;
  const upperCaseBanks = ["GTB", "GTBANK", "UBA", "FCMB", "OPAY", "KUDA", "PALMPAY"];

   return value.trim().split(" ").map(word => {
    const upperWord = word.toUpperCase();
      if (upperCaseBanks.includes(upperWord)) {
        return upperWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(" ");
  };

exports.normalizeEnumValue = (value, allowedValues) => {
  if (!value) return value;
  return allowedValues.find(
    item => item.toLowerCase() === value.trim().toLowerCase()
  );
};