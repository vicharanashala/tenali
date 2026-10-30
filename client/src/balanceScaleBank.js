export function createDynamicWeightBank(target) {
  let denominations = [];
  if (target >= 500) {
    denominations = [500, 100, 50, 10, 5, 1];
  } else if (target >= 100) {
    denominations = [100, 50, 10, 5, 1];
  } else if (target >= 15) {
    denominations = [50, 10, 5, 1];
  } else {
    denominations = [5, 1];
  }

  let bank = [];
  denominations.forEach(d => {
    let count = 4;
    if (d === 100) count = 10;
    if (d === 50) count = 6;
    if (d === 10) count = 15;
    if (d === 5) count = 8;
    if (d === 1) count = 15;

    const needed = Math.ceil(target / d) + 2;
    if (needed > count) {
      count = needed;
    }

    for (let i = 0; i < count; i++) {
      bank.push({ id: `bank-${d}-${i}-${Math.random()}`, val: d });
    }
  });
  return bank;
}
