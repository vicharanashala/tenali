import { useState, useRef, useMemo } from 'react';

// ─── Question Bank ───────────────────────────────────────────────────────────
// 6 modules: Direct Match, Similar Stories, Missing Info, Brackets, Both Sides, Mixed Challenge
// Each question: { equation, options: [{text, correct}], explanation }

const MODULES = [
  // ── Level 1 ── Direct Match ───────────────────────────────────────────
  {
    id: 1,
    title: 'Direct Match',
    subtitle: 'Pick the story that maps exactly to the equation.',
    color: '#6cc4ff',
    target: 12,
    questions: [
      {
        equation: '2x + 10 = 50',
        options: [
          { text: 'Riya bought 2 books costing x dollars each and paid $10 delivery. Total = $50.', correct: true },
          { text: 'Riya bought 10 books costing x dollars each. Total = $50.', correct: false },
          { text: 'Riya bought 2 books costing $10 each and the total was $50.', correct: false },
        ],
        explanation: '2x (2 books at x each) + 10 (flat delivery) = 50 (total bill).',
      },
      {
        equation: '3x + 5 = 20',
        options: [
          { text: 'Aman bought 3 notebooks costing x dollars each and paid $5 delivery. Total = $20.', correct: true },
          { text: 'Aman bought 5 notebooks costing x dollars each. Total = $20.', correct: false },
          { text: 'Aman bought 3 notebooks costing $5 each and paid $20.', correct: false },
        ],
        explanation: '3x (3 notebooks at x each) + 5 (delivery) = 20 (total).',
      },
      {
        equation: '4x + 8 = 40',
        options: [
          { text: 'Priya bought 4 pens at x dollars each and paid an $8 fee. Total = $40.', correct: true },
          { text: 'Priya bought 8 pens at x dollars each. Total = $40.', correct: false },
          { text: 'Priya bought 4 pens costing $8 each for $40 total.', correct: false },
        ],
        explanation: '4x (4 pens at x each) + 8 (fee) = 40 (total).',
      },
      {
        equation: '5x + 15 = 65',
        options: [
          { text: 'Sana rented 5 bikes at x dollars per hour and paid a $15 deposit. Total = $65.', correct: true },
          { text: 'Sana rented 15 bikes at x dollars each. Total = $65.', correct: false },
          { text: 'Sana rented 5 bikes for $15 each. Total = $65.', correct: false },
        ],
        explanation: '5x (5 bikes at x/hr) + 15 (deposit) = 65 (total).',
      },
      {
        equation: '6x + 12 = 60',
        options: [
          { text: 'Tom ordered 6 pizzas at x dollars each with a $12 service charge. Total = $60.', correct: true },
          { text: 'Tom ordered 12 pizzas at x dollars each. Total = $60.', correct: false },
          { text: 'Tom ordered 6 pizzas at $12 each. Total = $60.', correct: false },
        ],
        explanation: '6x (6 pizzas at x each) + 12 (service charge) = 60.',
      },
      {
        equation: 'x + 25 = 100',
        options: [
          { text: 'Maya already had $25 saved and earned x more dollars. She now has $100.', correct: true },
          { text: 'Maya earned x dollars and spent $25. She has $100 left.', correct: false },
          { text: 'Maya earned $25 and x is how much she owes. Total debt = $100.', correct: false },
        ],
        explanation: 'x (unknown amount) + 25 (already saved) = 100 (total).',
      },
      {
        equation: '7x + 3 = 38',
        options: [
          { text: 'Leo bought 7 stickers at x dollars each and paid $3 tax. Total = $38.', correct: true },
          { text: 'Leo bought 3 stickers at x dollars each. Total = $38.', correct: false },
          { text: 'Leo bought 7 stickers at $3 each. Total = $38.', correct: false },
        ],
        explanation: '7x (7 stickers at x each) + 3 (tax) = 38 (total).',
      },
      {
        equation: '2x + 20 = 80',
        options: [
          { text: 'Nina bought 2 tickets at x dollars each and paid $20 booking fee. Total = $80.', correct: true },
          { text: 'Nina bought 20 tickets at x dollars each. Total = $80.', correct: false },
          { text: 'Nina bought 2 tickets at $20 each. Total = $80.', correct: false },
        ],
        explanation: '2x (2 tickets at x each) + 20 (booking fee) = 80 (total).',
      },
      {
        equation: '9x + 1 = 28',
        options: [
          { text: 'Dev bought 9 erasers at x dollars each and paid $1 packing charge. Total = $28.', correct: true },
          { text: 'Dev bought 1 eraser at x dollars each. Total = $28.', correct: false },
          { text: 'Dev bought 9 erasers at $1 each. Total = $28.', correct: false },
        ],
        explanation: '9x (9 erasers at x each) + 1 (packing) = 28 (total).',
      },
      {
        equation: '3x + 9 = 30',
        options: [
          { text: 'Kira bought 3 candles at x dollars each and paid $9 delivery. Total = $30.', correct: true },
          { text: 'Kira bought 9 candles at x dollars each. Total = $30.', correct: false },
          { text: 'Kira bought 3 candles at $9 each. Total = $30.', correct: false },
        ],
        explanation: '3x (3 candles at x each) + 9 (delivery) = 30 (total).',
      },
      {
        equation: '4x + 4 = 20',
        options: [
          { text: 'Jake bought 4 brushes at x dollars each plus a $4 tax. Total = $20.', correct: true },
          { text: 'Jake bought 4 brushes at $4 each. Total was $20.', correct: false },
          { text: 'Jake bought 20 brushes at x dollars each. Total = $4.', correct: false },
        ],
        explanation: '4x (4 brushes at x each) + 4 (tax) = 20 (total).',
      },
      {
        equation: '10x + 5 = 55',
        options: [
          { text: 'Lily bought 10 stamps at x dollars each and paid a $5 envelope fee. Total = $55.', correct: true },
          { text: 'Lily bought 5 stamps at x dollars each. Total = $55.', correct: false },
          { text: 'Lily bought 10 stamps at $5 each. Total = $55.', correct: false },
        ],
        explanation: '10x (10 stamps at x each) + 5 (envelope fee) = 55 (total).',
      },
    ],
  },
  {
    id: 2,
    title: 'Similar Stories',
    subtitle: 'Multiple stories look right — only one is exact. Find it.',
    color: '#a78bfa',
    target: 15,
    questions: [
      {
        equation: '5x - 10 = 40',
        options: [
          { text: '5 pizzas at x dollars each with a $10 discount. Total = $40.', correct: true },
          { text: '5 pizzas at x dollars each with $10 delivery added. Total = $40.', correct: false },
          { text: '5 pizzas at x dollars each with a $10 discount per pizza. Total = $40.', correct: false },
          { text: '10 pizzas at x dollars each with a $5 discount. Total = $40.', correct: false },
        ],
        explanation: '5x - 10 = 40: multiply then subtract a flat $10 discount. Delivery adds $10 (5x + 10); per-pizza discount is 5(x - 10).',
      },
      {
        equation: '4x - 8 = 24',
        options: [
          { text: '4 shirts at x dollars each with an $8 coupon applied. Total = $24.', correct: true },
          { text: '4 shirts at x dollars each with $8 extra shipping added. Total = $24.', correct: false },
          { text: '4 shirts at x dollars each with an $8 coupon applied per shirt. Total = $24.', correct: false },
          { text: '8 shirts at x dollars each with a $4 coupon applied. Total = $24.', correct: false },
        ],
        explanation: '4x - 8 = 24: subtract $8 once for the coupon. Shipping adds $8 (4x + 8); per-shirt coupon is 4(x - 8).',
      },
      {
        equation: '6x - 6 = 30',
        options: [
          { text: '6 pens at x dollars each with a $6 rebate. Total = $30.', correct: true },
          { text: '6 pens at x dollars each with a $6 handling fee added. Total = $30.', correct: false },
          { text: '6 pens at x dollars each with a $6 rebate per pen. Total = $30.', correct: false },
          { text: '30 pens at x dollars each with a $6 rebate. Total = $30.', correct: false },
        ],
        explanation: '6x - 6 = 30: the $6 rebate is subtracted once from 6x. Handling fee adds $6 (6x + 6); per-pen rebate is 6(x - 6).',
      },
      {
        equation: '3x - 12 = 15',
        options: [
          { text: '3 bags at x dollars each after a $12 loyalty discount. Total = $15.', correct: true },
          { text: '3 bags at x dollars each with $12 gift-wrapping added. Total = $15.', correct: false },
          { text: '3 bags at x dollars each after a $12 discount per bag. Total = $15.', correct: false },
          { text: '12 bags at x dollars each after a $3 loyalty discount. Total = $15.', correct: false },
        ],
        explanation: '3x - 12 = 15: flat $12 loyalty discount subtracted from 3x. Gift-wrapping adds $12 (3x + 12); per-bag discount is 3(x - 12).',
      },
      {
        equation: '7x - 14 = 56',
        options: [
          { text: '7 notebooks at x dollars each with a $14 discount card. Total = $56.', correct: true },
          { text: '7 notebooks at x dollars each with $14 shipping added. Total = $56.', correct: false },
          { text: '7 notebooks at x dollars each with a $14 discount per notebook. Total = $56.', correct: false },
          { text: '14 notebooks at x dollars each with a $7 discount card. Total = $56.', correct: false },
        ],
        explanation: '7x - 14 = 56: $14 is subtracted once. Shipping adds $14 (7x + 14); per-notebook discount is 7(x - 14).',
      },
      {
        equation: '2x - 4 = 10',
        options: [
          { text: '2 cups of coffee at x dollars each after a $4 member discount. Total = $10.', correct: true },
          { text: '2 cups of coffee at x dollars each plus a $4 tip added. Total = $10.', correct: false },
          { text: '2 cups of coffee at x dollars each after a $4 discount per cup. Total = $10.', correct: false },
          { text: '4 cups of coffee at x dollars each after a $2 member discount. Total = $10.', correct: false },
        ],
        explanation: '2x - 4 = 10: member discount subtracts $4 flat. Tip adds $4 (2x + 4); per-cup discount is 2(x - 4).',
      },
      {
        equation: '8x - 16 = 48',
        options: [
          { text: '8 flowers at x dollars each with a $16 wholesale rebate. Total = $48.', correct: true },
          { text: '8 flowers at x dollars each with $16 delivery added. Total = $48.', correct: false },
          { text: '8 flowers at x dollars each with a $16 rebate per flower. Total = $48.', correct: false },
          { text: '16 flowers at x dollars each with an $8 wholesale rebate. Total = $48.', correct: false },
        ],
        explanation: '8x - 16 = 48: $16 rebate reduces total cost. Delivery adds $16 (8x + 16); per-flower rebate is 8(x - 16).',
      },
      {
        equation: '5x - 20 = 30',
        options: [
          { text: '5 games at x dollars each after a $20 promotional discount. Total = $30.', correct: true },
          { text: '5 games at x dollars each plus a $20 DLC fee added. Total = $30.', correct: false },
          { text: '5 games at x dollars each after a $20 discount per game. Total = $30.', correct: false },
          { text: '20 games at x dollars each after a $5 promotional discount. Total = $30.', correct: false },
        ],
        explanation: '5x - 20 = 30: promotional discount subtracts $20 flat. DLC fee adds $20 (5x + 20); per-game discount is 5(x - 20).',
      },
      {
        equation: '9x - 9 = 63',
        options: [
          { text: '9 mugs at x dollars each with a $9 store credit applied. Total = $63.', correct: true },
          { text: '9 mugs at x dollars each with a $9 gift-wrap fee added. Total = $63.', correct: false },
          { text: '9 mugs at x dollars each with a $9 store credit per mug. Total = $63.', correct: false },
          { text: '9 mugs costing $9 each with an x dollar credit applied. Total = $63.', correct: false },
        ],
        explanation: '9x - 9 = 63: store credit subtracts $9 flat. Gift-wrap adds $9 (9x + 9); per-mug credit is 9(x - 9).',
      },
      {
        equation: '10x - 30 = 70',
        options: [
          { text: '10 posters at x dollars each after a $30 bulk discount. Total = $70.', correct: true },
          { text: '10 posters at x dollars each with $30 frame fee added. Total = $70.', correct: false },
          { text: '10 posters at x dollars each after a $30 discount per poster. Total = $70.', correct: false },
          { text: '30 posters at x dollars each after a $10 bulk discount. Total = $70.', correct: false },
        ],
        explanation: '10x - 30 = 70: $30 bulk discount is subtracted once. Frame fee adds $30 (10x + 30); per-poster discount is 10(x - 30).',
      },
      {
        equation: '4x - 20 = 40',
        options: [
          { text: '4 chairs at x dollars each after a $20 sale discount. Total = $40.', correct: true },
          { text: '4 chairs at x dollars each with $20 assembly fee added. Total = $40.', correct: false },
          { text: '4 chairs at x dollars each after a $20 discount per chair. Total = $40.', correct: false },
          { text: '20 chairs at x dollars each after a $4 sale discount. Total = $40.', correct: false },
        ],
        explanation: '4x - 20 = 40: sale discount subtracts $20 flat. Assembly adds $20 (4x + 20); per-chair discount is 4(x - 20).',
      },
      {
        equation: '6x - 30 = 12',
        options: [
          { text: '6 bottles at x dollars each after a $30 group discount. Total = $12.', correct: true },
          { text: '6 bottles at x dollars each with $30 deposit added. Total = $12.', correct: false },
          { text: '6 bottles at x dollars each after a $30 discount per bottle. Total = $12.', correct: false },
          { text: '30 bottles at x dollars each after a $6 group discount. Total = $12.', correct: false },
        ],
        explanation: '6x - 30 = 12: group discount subtracts $30 once. Deposit adds $30 (6x + 30); per-bottle discount is 6(x - 30).',
      },
      {
        equation: '3x - 6 = 18',
        options: [
          { text: '3 scarves at x dollars each with a $6 clearance discount. Total = $18.', correct: true },
          { text: '3 scarves at x dollars each with $6 packaging fee added. Total = $18.', correct: false },
          { text: '3 scarves at x dollars each with a $6 clearance discount per scarf. Total = $18.', correct: false },
          { text: '6 scarves at x dollars each with a $3 clearance discount. Total = $18.', correct: false },
        ],
        explanation: '3x - 6 = 18: clearance discount subtracts $6 flat. Packaging adds $6 (3x + 6); per-scarf discount is 3(x - 6).',
      },
      {
        equation: '11x - 11 = 77',
        options: [
          { text: '11 canvases at x dollars each with an $11 member rebate. Total = $77.', correct: true },
          { text: '11 canvases at x dollars each with $11 shipping added. Total = $77.', correct: false },
          { text: '11 canvases at x dollars each with an $11 member rebate per canvas. Total = $77.', correct: false },
          { text: '11 canvases costing $11 each with an x dollar rebate applied. Total = $77.', correct: false },
        ],
        explanation: '11x - 11 = 77: member rebate subtracts $11 flat. Shipping adds $11 (11x + 11); per-canvas rebate is 11(x - 11).',
      },
      {
        equation: '2x - 14 = 20',
        options: [
          { text: '2 lamps at x dollars each after a $14 seasonal discount. Total = $20.', correct: true },
          { text: '2 lamps at x dollars each with $14 installation charge added. Total = $20.', correct: false },
          { text: '2 lamps at x dollars each after a $14 discount per lamp. Total = $20.', correct: false },
          { text: '14 lamps at x dollars each after a $2 seasonal discount. Total = $20.', correct: false },
        ],
        explanation: '2x - 14 = 20: seasonal discount subtracts $14 flat. Installation adds $14 (2x + 14); per-lamp discount is 2(x - 14).',
      },
    ],
  },
  {
    id: 3,
    title: 'Missing Information',
    subtitle: 'The story is given — find the missing piece that fits the equation.',
    color: '#34d399',
    target: 18,
    questions: [
      {
        equation: '4x + 8 = 40',
        prompt: 'Riya bought ____ books costing x dollars each and paid an $8 fee. Total = $40.',
        options: [
          { text: '2 books', correct: false },
          { text: '3 books', correct: false },
          { text: '4 books', correct: true },
          { text: '8 books', correct: false },
        ],
        explanation: '4x + 8 = 40 — the coefficient 4 tells us Riya bought 4 books.',
      },
      {
        equation: '3x + 6 = 24',
        prompt: 'Aman bought 3 pens at x dollars each. The ____ fee was $6. Total = $24.',
        options: [
          { text: '$3 delivery', correct: false },
          { text: '$6 delivery', correct: true },
          { text: '$24 delivery', correct: false },
          { text: '$12 delivery', correct: false },
        ],
        explanation: '3x + 6 = 24 — the constant 6 represents the $6 fee.',
      },
      {
        equation: '5x + 10 = 60',
        prompt: 'Sana bought 5 toys at x dollars each with a $10 tax. Total = ____.',
        options: [
          { text: '$50', correct: false },
          { text: '$55', correct: false },
          { text: '$60', correct: true },
          { text: '$70', correct: false },
        ],
        explanation: '5x + 10 = 60 — the right-hand side 60 is the total.',
      },
      {
        equation: '6x + 12 = 48',
        prompt: 'Tom ordered ____ juices at x dollars each with a $12 tray charge. Total = $48.',
        options: [
          { text: '4', correct: false },
          { text: '5', correct: false },
          { text: '6', correct: true },
          { text: '12', correct: false },
        ],
        explanation: '6x + 12 = 48 — coefficient 6 shows 6 juices were ordered.',
      },
      {
        equation: '2x + 16 = 50',
        prompt: 'Mia bought 2 jackets at x dollars each and paid ____ shipping. Total = $50.',
        options: [
          { text: '$2', correct: false },
          { text: '$8', correct: false },
          { text: '$16', correct: true },
          { text: '$50', correct: false },
        ],
        explanation: '2x + 16 = 50 — the constant 16 is the shipping charge.',
      },
      {
        equation: 'x + 30 = 75',
        prompt: 'Jake had x dollars. He found ____ more. Now he has $75.',
        options: [
          { text: '$25', correct: false },
          { text: '$30', correct: true },
          { text: '$45', correct: false },
          { text: '$75', correct: false },
        ],
        explanation: 'x + 30 = 75 — the constant 30 is what Jake found.',
      },
      {
        equation: '7x + 7 = 56',
        prompt: 'Lily bought 7 books at x dollars each with a ____ gift-wrap fee. Total = $56.',
        options: [
          { text: '$5', correct: false },
          { text: '$6', correct: false },
          { text: '$7', correct: true },
          { text: '$14', correct: false },
        ],
        explanation: '7x + 7 = 56 — the constant 7 is the gift-wrap fee.',
      },
      {
        equation: '9x + 18 = 90',
        prompt: 'Dev rented 9 bikes at x dollars per day with an $18 insurance fee. Total = ____.',
        options: [
          { text: '$72', correct: false },
          { text: '$80', correct: false },
          { text: '$90', correct: true },
          { text: '$108', correct: false },
        ],
        explanation: '9x + 18 = 90 — the right-hand side 90 is the total.',
      },
      {
        equation: '3x + 21 = 51',
        prompt: 'Kira bought ____ scarves at x dollars each and paid a $21 tax. Total = $51.',
        options: [
          { text: '2', correct: false },
          { text: '3', correct: true },
          { text: '7', correct: false },
          { text: '21', correct: false },
        ],
        explanation: '3x + 21 = 51 — coefficient 3 means 3 scarves were bought.',
      },
      {
        equation: '8x + 4 = 68',
        prompt: 'Uma bought 8 notebooks at x dollars each. She also paid ____ for a bag. Total = $68.',
        options: [
          { text: '$2', correct: false },
          { text: '$4', correct: true },
          { text: '$8', correct: false },
          { text: '$68', correct: false },
        ],
        explanation: '8x + 4 = 68 — constant 4 is the bag cost.',
      },
      {
        equation: '5x + 25 = 100',
        prompt: 'Ray bought 5 helmets at x dollars each. He paid ____ extra for customisation. Total = $100.',
        options: [
          { text: '$5', correct: false },
          { text: '$20', correct: false },
          { text: '$25', correct: true },
          { text: '$100', correct: false },
        ],
        explanation: '5x + 25 = 100 — the constant 25 is the customisation charge.',
      },
      {
        equation: '4x + 12 = 36',
        prompt: 'Nina bought 4 mugs at x dollars each with a ____ delivery charge. Total = $36.',
        options: [
          { text: '$4', correct: false },
          { text: '$9', correct: false },
          { text: '$12', correct: true },
          { text: '$36', correct: false },
        ],
        explanation: '4x + 12 = 36 — constant 12 is the delivery charge.',
      },
      {
        equation: '6x + 6 = 42',
        prompt: 'Sam bought ____ packs at x dollars each with a $6 recycling fee. Total = $42.',
        options: [
          { text: '4', correct: false },
          { text: '5', correct: false },
          { text: '6', correct: true },
          { text: '7', correct: false },
        ],
        explanation: '6x + 6 = 42 — coefficient 6 means 6 packs were purchased.',
      },
      {
        equation: '10x + 20 = 120',
        prompt: 'Ava bought 10 chairs at x dollars each. She paid ____ for assembly. Total = $120.',
        options: [
          { text: '$10', correct: false },
          { text: '$12', correct: false },
          { text: '$20', correct: true },
          { text: '$100', correct: false },
        ],
        explanation: '10x + 20 = 120 — constant 20 is the assembly fee.',
      },
      {
        equation: '2x + 40 = 80',
        prompt: 'Ben bought 2 lamps at x dollars each. He paid ____ for delivery. Total = $80.',
        options: [
          { text: '$20', correct: false },
          { text: '$30', correct: false },
          { text: '$40', correct: true },
          { text: '$80', correct: false },
        ],
        explanation: '2x + 40 = 80 — constant 40 is the delivery fee.',
      },
      {
        equation: '11x + 11 = 99',
        prompt: 'Cleo bought ____ journals at x dollars each with an $11 membership fee. Total = $99.',
        options: [
          { text: '9', correct: false },
          { text: '10', correct: false },
          { text: '11', correct: true },
          { text: '99', correct: false },
        ],
        explanation: '11x + 11 = 99 — coefficient 11 means 11 journals.',
      },
      {
        equation: '7x + 14 = 70',
        prompt: 'Omar bought 7 caps at x dollars each and paid ____ in taxes. Total = $70.',
        options: [
          { text: '$7', correct: false },
          { text: '$10', correct: false },
          { text: '$14', correct: true },
          { text: '$70', correct: false },
        ],
        explanation: '7x + 14 = 70 — constant 14 is the tax.',
      },
      {
        equation: '3x + 18 = 45',
        prompt: 'Tara bought 3 cushions at x dollars each with an $18 stitching fee. Total = ____.',
        options: [
          { text: '$27', correct: false },
          { text: '$36', correct: false },
          { text: '$45', correct: true },
          { text: '$63', correct: false },
        ],
        explanation: '3x + 18 = 45 — the right-hand side 45 is the total.',
      },
    ],
  },
  {
    id: 4,
    title: 'Brackets & Grouped Expressions',
    subtitle: 'Equations with brackets — find the story that groups correctly.',
    color: '#f59e0b',
    target: 15,
    questions: [
      {
        equation: '2(x + 5) = 30',
        options: [
          { text: 'Two notebooks each cost x dollars and each notebook has a $5 cover charge. Total = $30.', correct: true },
          { text: 'Two notebooks cost x dollars each and $5 delivery was added once. Total = $30.', correct: false },
          { text: 'Five notebooks cost x dollars each. Total = $30.', correct: false },
          { text: 'Two notebooks cost $5 each. Total = $30.', correct: false },
        ],
        explanation: '2(x+5)=30: the bracket means (x+5) is per notebook — so each notebook costs x+$5.',
      },
      {
        equation: '3(x + 4) = 33',
        options: [
          { text: '3 shirts each priced at x dollars with a $4 embroidery charge per shirt. Total = $33.', correct: true },
          { text: '3 shirts at x dollars each plus $4 flat shipping. Total = $33.', correct: false },
          { text: '4 shirts at x dollars each. Total = $33.', correct: false },
          { text: '3 shirts at $4 each. Total = $33.', correct: false },
        ],
        explanation: '3(x+4)=33: the +4 is per shirt, not a flat fee.',
      },
      {
        equation: '4(x + 3) = 28',
        options: [
          { text: '4 bags each at x dollars plus a $3 zipper upgrade per bag. Total = $28.', correct: true },
          { text: '4 bags at x dollars each plus $3 flat delivery. Total = $28.', correct: false },
          { text: '3 bags at x dollars each. Total = $28.', correct: false },
          { text: '4 bags at $3 each. Total = $28.', correct: false },
        ],
        explanation: '4(x+3)=28: the $3 zipper upgrade applies to each of the 4 bags.',
      },
      {
        equation: '5(x + 2) = 35',
        options: [
          { text: '5 mugs at x dollars each plus a $2 engraving fee per mug. Total = $35.', correct: true },
          { text: '5 mugs at x dollars each with $2 flat shipping. Total = $35.', correct: false },
          { text: '2 mugs at x dollars each. Total = $35.', correct: false },
          { text: '5 mugs at $2 each. Total = $35.', correct: false },
        ],
        explanation: '5(x+2)=35: the $2 engraving is per mug, totalling 5×(x+2).',
      },
      {
        equation: '6(x + 1) = 42',
        options: [
          { text: '6 pens at x dollars each with a $1 tip jar contribution per pen. Total = $42.', correct: true },
          { text: '6 pens at x dollars each with $1 flat packaging. Total = $42.', correct: false },
          { text: '1 pen at x dollars each. Total = $42.', correct: false },
          { text: '6 pens at $1 each. Total = $42.', correct: false },
        ],
        explanation: '6(x+1)=42: the $1 tip applies per pen, not as a flat fee.',
      },
      {
        equation: '2(x + 10) = 50',
        options: [
          { text: '2 tickets at x dollars each plus a $10 processing fee per ticket. Total = $50.', correct: true },
          { text: '2 tickets at x dollars each plus $10 flat booking fee. Total = $50.', correct: false },
          { text: '10 tickets at x dollars each. Total = $50.', correct: false },
          { text: '2 tickets at $10 each. Total = $50.', correct: false },
        ],
        explanation: '2(x+10)=50: the $10 processing fee is per ticket.',
      },
      {
        equation: '3(x + 7) = 36',
        options: [
          { text: '3 helmets at x dollars each with a $7 visor add-on per helmet. Total = $36.', correct: true },
          { text: '3 helmets at x dollars each plus $7 flat insurance. Total = $36.', correct: false },
          { text: '7 helmets at x dollars each. Total = $36.', correct: false },
          { text: '3 helmets at $7 each. Total = $36.', correct: false },
        ],
        explanation: '3(x+7)=36: $7 visor is per helmet, multiplied by 3.',
      },
      {
        equation: '4(x + 6) = 48',
        options: [
          { text: '4 laptops at x dollars each with a $6 warranty fee per laptop. Total = $48.', correct: true },
          { text: '4 laptops at x dollars each plus $6 flat delivery. Total = $48.', correct: false },
          { text: '6 laptops at x dollars each. Total = $48.', correct: false },
          { text: '4 laptops at $6 each. Total = $48.', correct: false },
        ],
        explanation: '4(x+6)=48: the $6 warranty is per laptop, so 4 laptops × (x+6).',
      },
      {
        equation: '5(x + 8) = 60',
        options: [
          { text: '5 caps at x dollars each with an $8 custom patch per cap. Total = $60.', correct: true },
          { text: '5 caps at x dollars each plus $8 flat handling. Total = $60.', correct: false },
          { text: '8 caps at x dollars each. Total = $60.', correct: false },
          { text: '5 caps at $8 each. Total = $60.', correct: false },
        ],
        explanation: '5(x+8)=60: the $8 custom patch applies to each of the 5 caps.',
      },
      {
        equation: '7(x + 2) = 63',
        options: [
          { text: '7 toys at x dollars each with a $2 gift-wrap per toy. Total = $63.', correct: true },
          { text: '7 toys at x dollars each plus $2 flat gift-wrap. Total = $63.', correct: false },
          { text: '2 toys at x dollars each. Total = $63.', correct: false },
          { text: '7 toys at $2 each. Total = $63.', correct: false },
        ],
        explanation: '7(x+2)=63: $2 gift-wrap is per toy, hence 7×(x+2).',
      },
      {
        equation: '3(x + 9) = 45',
        options: [
          { text: '3 plants at x dollars each with a $9 ceramic pot per plant. Total = $45.', correct: true },
          { text: '3 plants at x dollars each plus $9 flat delivery. Total = $45.', correct: false },
          { text: '9 plants at x dollars each. Total = $45.', correct: false },
          { text: '3 plants at $9 each. Total = $45.', correct: false },
        ],
        explanation: '3(x+9)=45: the $9 pot is per plant.',
      },
      {
        equation: '6(x + 5) = 60',
        options: [
          { text: '6 flowers at x dollars each with a $5 vase per flower. Total = $60.', correct: true },
          { text: '6 flowers at x dollars each plus $5 flat vase. Total = $60.', correct: false },
          { text: '5 flowers at x dollars each. Total = $60.', correct: false },
          { text: '6 flowers at $5 each. Total = $60.', correct: false },
        ],
        explanation: '6(x+5)=60: the $5 vase cost is per flower.',
      },
      {
        equation: '4(x + 10) = 80',
        options: [
          { text: '4 jerseys at x dollars each with $10 personalisation per jersey. Total = $80.', correct: true },
          { text: '4 jerseys at x dollars each plus $10 flat shipping. Total = $80.', correct: false },
          { text: '10 jerseys at x dollars each. Total = $80.', correct: false },
          { text: '4 jerseys at $10 each. Total = $80.', correct: false },
        ],
        explanation: '4(x+10)=80: personalisation of $10 applies per jersey.',
      },
      {
        equation: '2(x + 15) = 70',
        options: [
          { text: '2 watches at x dollars each with a $15 battery fee per watch. Total = $70.', correct: true },
          { text: '2 watches at x dollars each plus $15 flat insurance. Total = $70.', correct: false },
          { text: '15 watches at x dollars each. Total = $70.', correct: false },
          { text: '2 watches at $15 each. Total = $70.', correct: false },
        ],
        explanation: '2(x+15)=70: the $15 battery fee applies to each of the 2 watches.',
      },
      {
        equation: '8(x + 3) = 56',
        options: [
          { text: '8 candles at x dollars each with a $3 wick upgrade per candle. Total = $56.', correct: true },
          { text: '8 candles at x dollars each plus $3 flat packaging. Total = $56.', correct: false },
          { text: '3 candles at x dollars each. Total = $56.', correct: false },
          { text: '8 candles at $3 each. Total = $56.', correct: false },
        ],
        explanation: '8(x+3)=56: the $3 wick upgrade applies to each candle.',
      },
    ],
  },
  {
    id: 5,
    title: 'Variables on Both Sides',
    subtitle: 'Two quantities are equal — identify who is doing what.',
    color: '#f87171',
    target: 12,
    questions: [
      {
        equation: '3x + 10 = 2x + 25',
        options: [
          { text: 'Rahul buys 3 notebooks + $10 delivery. Aman buys 2 notebooks + $25 delivery. Both bills are equal.', correct: true },
          { text: 'Rahul buys 3 notebooks costing $10 each.', correct: false },
          { text: 'Aman buys 2 notebooks costing $25 each.', correct: false },
          { text: 'Rahul buys 2 notebooks + $10 delivery. Aman buys 3 notebooks + $25 delivery.', correct: false },
        ],
        explanation: '3x+10=2x+25: left side = Rahul\'s bill, right side = Aman\'s bill. Both are equal.',
      },
      {
        equation: '5x + 4 = 3x + 20',
        options: [
          { text: 'Plan A: 5 movies for x dollars each + $4 fee. Plan B: 3 movies for x dollars each + $20 fee. Both cost the same.', correct: true },
          { text: 'Plan A: 5 movies at $4 each. Plan B: 3 movies at $20 each.', correct: false },
          { text: 'Plan A: 3 movies for x dollars each + $4 fee. Plan B: 5 movies for x dollars each + $20 fee.', correct: false },
          { text: 'Plan A: 5 movies at $20. Plan B: 3 movies at $4.', correct: false },
        ],
        explanation: '5x+4=3x+20: Plan A has more movies but a smaller flat fee; both equal at the same x.',
      },
      {
        equation: '4x + 6 = x + 24',
        options: [
          { text: 'Store A: 4 pens for x dollars each + $6 tax. Store B: 1 pen for x dollars + $24 gift voucher. Both equal.', correct: true },
          { text: 'Store A: 1 pen for x dollars + $6. Store B: 4 pens for x dollars + $24.', correct: false },
          { text: 'Store A: 4 pens at $6 each. Store B: 1 pen at $24.', correct: false },
          { text: 'Store A: 4 pens at $24. Store B: 1 pen at $6.', correct: false },
        ],
        explanation: '4x+6=x+24: coefficient of x identifies how many items each party is buying.',
      },
      {
        equation: '6x + 5 = 2x + 29',
        options: [
          { text: 'Gym A charges 6x per month + $5 joining fee. Gym B charges 2x per month + $29 joining fee. Same total.', correct: true },
          { text: 'Gym A charges 2x per month + $5 joining fee. Gym B charges 6x per month + $29 joining fee.', correct: false },
          { text: 'Gym A charges $6 per month + 5x. Gym B charges $2 per month + 29x.', correct: false },
          { text: 'Gym A charges $29 joining. Gym B charges $5 joining.', correct: false },
        ],
        explanation: '6x+5=2x+29: left is Gym A (more expensive per month, cheaper joining), right is Gym B.',
      },
      {
        equation: '7x + 2 = 4x + 17',
        options: [
          { text: 'Path 1: 7 km at x dollars/km + $2 toll. Path 2: 4 km at x dollars/km + $17 toll. Same cost.', correct: true },
          { text: 'Path 1: 4 km at x dollars/km + $2 toll. Path 2: 7 km at x dollars/km + $17 toll.', correct: false },
          { text: 'Path 1: 7 km at $2/km. Path 2: 4 km at $17/km.', correct: false },
          { text: 'Path 1: 7 km at $17/km. Path 2: 4 km at $2/km.', correct: false },
        ],
        explanation: '7x+2=4x+17: Path 1 has more km but a smaller toll; Path 2 fewer km but higher toll.',
      },
      {
        equation: '2x + 30 = 5x + 6',
        options: [
          { text: 'Taxi A: 2 km at x dollars/km + $30 base fare. Taxi B: 5 km at x dollars/km + $6 base fare. Same bill.', correct: true },
          { text: 'Taxi A: 5 km at x dollars/km + $30 base fare. Taxi B: 2 km at x dollars/km + $6 base fare.', correct: false },
          { text: 'Taxi A: 2 km at $30/km. Taxi B: 5 km at $6/km.', correct: false },
          { text: 'Taxi A: 2 km at $6/km. Taxi B: 5 km at $30/km.', correct: false },
        ],
        explanation: '2x+30=5x+6: Taxi A fewer km but higher base; Taxi B more km but lower base. Equal at some x.',
      },
      {
        equation: '8x + 1 = 3x + 26',
        options: [
          { text: 'Worker A earns 8x per hour + $1 bonus. Worker B earns 3x per hour + $26 bonus. Same total.', correct: true },
          { text: 'Worker A earns 3x per hour + $1 bonus. Worker B earns 8x per hour + $26 bonus.', correct: false },
          { text: 'Worker A earns $8/hr + 1x. Worker B earns $3/hr + 26x.', correct: false },
          { text: 'Worker A earns $8 per hour. Worker B earns $3 per hour.', correct: false },
        ],
        explanation: '8x+1=3x+26: Worker A higher hourly rate, smaller bonus; Worker B lower rate, bigger bonus.',
      },
      {
        equation: '9x + 0 = 4x + 35',
        options: [
          { text: 'Deal A: 9 items at x dollars each, no surcharge. Deal B: 4 items at x dollars each + $35 voucher bonus. Same total.', correct: true },
          { text: 'Deal A: 4 items at x dollars each. Deal B: 9 items at x dollars each + $35.', correct: false },
          { text: 'Deal A: 9 items at $35 each. Deal B: 4 items at $0 each.', correct: false },
          { text: 'Deal A: 9 items at $0. Deal B: 4 items at $35.', correct: false },
        ],
        explanation: '9x=4x+35: Deal A just 9x; Deal B 4x plus a $35 credit. Equal at x=7.',
      },
      {
        equation: '3x + 15 = 6x + 3',
        options: [
          { text: 'Subscription A: 3 months at x dollars/mo + $15 setup. Subscription B: 6 months at x dollars/mo + $3 setup. Same total.', correct: true },
          { text: 'Subscription A: 6 months at x dollars/mo + $15 setup. Subscription B: 3 months at x dollars/mo + $3 setup.', correct: false },
          { text: 'Subscription A: 3 months at $15/mo. Subscription B: 6 months at $3/mo.', correct: false },
          { text: 'Subscription A: 3 months at $3/mo. Subscription B: 6 months at $15/mo.', correct: false },
        ],
        explanation: '3x+15=6x+3: A shorter with larger setup; B longer with smaller setup.',
      },
      {
        equation: '10x + 5 = 7x + 20',
        options: [
          { text: 'Route A: 10 km at x dollars/km + $5 parking. Route B: 7 km at x dollars/km + $20 parking. Same cost.', correct: true },
          { text: 'Route A: 7 km at x dollars/km + $5 parking. Route B: 10 km at x dollars/km + $20 parking.', correct: false },
          { text: 'Route A: 10 km at $20/km. Route B: 7 km at $5/km.', correct: false },
          { text: 'Route A: 10 km at $5/km. Route B: 7 km at $20/km.', correct: false },
        ],
        explanation: '10x+5=7x+20: Route A is longer but cheaper parking; Route B shorter but more expensive parking.',
      },
      {
        equation: '4x + 18 = x + 30',
        options: [
          { text: 'Club A: 4 sessions at x dollars each + $18 registration. Club B: 1 session at x dollars + $30 registration. Same cost.', correct: true },
          { text: 'Club A: 1 session at x dollars + $18 registration. Club B: 4 sessions at x dollars + $30 registration.', correct: false },
          { text: 'Club A: 4 sessions at $18 each. Club B: 1 session at $30.', correct: false },
          { text: 'Club A: 4 sessions at $30 each. Club B: 1 session at $18.', correct: false },
        ],
        explanation: '4x+18=x+30: Club A more sessions + smaller registration; Club B 1 session + bigger registration.',
      },
      {
        equation: '5x + 7 = 2x + 22',
        options: [
          { text: 'Team A rents 5 bikes at x dollars each + $7 helmet fee. Team B rents 2 bikes at x dollars each + $22 helmet fee. Equal.', correct: true },
          { text: 'Team A rents 2 bikes at x dollars each + $7 helmet fee. Team B rents 5 bikes at x dollars each + $22 helmet fee.', correct: false },
          { text: 'Team A pays $5 per bike. Team B pays $2 per bike.', correct: false },
          { text: 'Team A rents 5 bikes at $22/bike. Team B rents 2 bikes at $7/bike.', correct: false },
        ],
        explanation: '5x+7=2x+22: Team A more bikes + smaller fee; Team B fewer bikes + larger fee.',
      },
    ],
  },
  {
    id: 6,
    title: 'Mixed Challenge',
    subtitle: 'A mix of all types — brackets, both sides, negatives, and more.',
    color: '#fb923c',
    target: 15,
    questions: [
      {
        equation: '5(x - 2) = 40',
        options: [
          { text: 'Five T-shirts each cost x dollars and each gets a $2 discount. Total = $40.', correct: true },
          { text: 'Five T-shirts cost x dollars each and a $2 discount was applied once. Total = $40.', correct: false },
          { text: 'Two T-shirts cost x dollars each. Total = $40.', correct: false },
          { text: 'Five T-shirts cost $2 each. Total = $40.', correct: false },
        ],
        explanation: '5(x-2)=40: the $2 discount is per T-shirt (inside the bracket), not a flat once-off.',
      },
      {
        equation: '2x + 3x = 50',
        options: [
          { text: 'Priya earns 2x dollars from morning shifts and 3x dollars from evening shifts. Total = $50.', correct: true },
          { text: 'Priya earns $2 in the morning and $3 in the evening. Total = $50.', correct: false },
          { text: 'Priya earns 5 dollars on x different days. Total = $50.', correct: false },
          { text: 'Priya earns 2 dollars per hour for 3x hours. Total = $50.', correct: false },
        ],
        explanation: '2x+3x=50: two variable income sources combine to $50. Like terms add to 5x=50.',
      },
      {
        equation: 'x/2 + 5 = 15',
        options: [
          { text: 'Half of a jar of coins plus $5 from Mia equals $15 total.', correct: true },
          { text: '2 jars of coins plus $5 equals $15.', correct: false },
          { text: 'A jar of coins divided by 5 equals $15.', correct: false },
          { text: '5 jars of coins plus $2 equals $15.', correct: false },
        ],
        explanation: 'x/2+5=15: x is the jar total; half of it plus $5 = $15.',
      },
      {
        equation: '2(3x + 1) = 20',
        options: [
          { text: '2 boxes each contain 3 items at x dollars each plus a $1 packing. Total = $20.', correct: true },
          { text: '2 boxes at 3x dollars each plus $1 flat. Total = $20.', correct: false },
          { text: '3 boxes with x items each plus $2. Total = $20.', correct: false },
          { text: '6 items at x dollars each minus $1. Total = $20.', correct: false },
        ],
        explanation: '2(3x+1)=20: each box has (3x+1) value; two boxes give 2(3x+1)=20.',
      },
      {
        equation: '6x - 2x = 32',
        options: [
          { text: 'A factory makes 6x units but 2x are defective. Good units sold = 32.', correct: true },
          { text: 'A factory makes 6 units and loses 2x. Total sold = 32.', correct: false },
          { text: 'A factory makes 6x units costing $2 each. Total = $32.', correct: false },
          { text: 'A factory makes 8x units and sells 32.', correct: false },
        ],
        explanation: '6x-2x=4x=32: 6x made, 2x defective, leaving 4x=32 good units.',
      },
      {
        equation: '5x + 3 = 3x + 13',
        options: [
          { text: 'Shop A: 5 kg of rice at x dollars/kg + $3 bag. Shop B: 3 kg of rice at x dollars/kg + $13 bag. Same bill.', correct: true },
          { text: 'Shop A: 3 kg at x dollars/kg + $3. Shop B: 5 kg at x dollars/kg + $13.', correct: false },
          { text: 'Shop A: 5 kg at $13/kg. Shop B: 3 kg at $3/kg.', correct: false },
          { text: 'Shop A: 5 kg at $3/kg. Shop B: 3 kg at $13/kg.', correct: false },
        ],
        explanation: '5x+3=3x+13: Shop A more kg + cheaper bag, Shop B fewer kg + pricier bag.',
      },
      {
        equation: '4(x + 7) = 60',
        options: [
          { text: '4 candles at x dollars each with a $7 holder per candle. Total = $60.', correct: true },
          { text: '4 candles at x dollars each with $7 flat delivery. Total = $60.', correct: false },
          { text: '7 candles at x dollars each. Total = $60.', correct: false },
          { text: '4 candles at $7 each. Total = $60.', correct: false },
        ],
        explanation: '4(x+7)=60: the $7 holder is per candle (inside bracket × 4).',
      },
      {
        equation: '3x - 2x + 10 = 25',
        options: [
          { text: 'Sam earned 3x dollars and spent 2x dollars, keeping a net of x. He added $10 savings. Total = $25.', correct: true },
          { text: 'Sam earned 3x dollars and $10. He spent 2x and has $25 left.', correct: false },
          { text: 'Sam has 3 bags of x dollars and 2 extra bags. He adds $10. Total = $25.', correct: false },
          { text: 'Sam earned 3x and paid 2x tax. Net + $10 = $25.', correct: false },
        ],
        explanation: '3x-2x+10=x+10=25: net income x plus $10 savings equals $25.',
      },
      {
        equation: 'x/3 + 8 = 20',
        options: [
          { text: 'One-third of the prize money plus $8 donation equals $20.', correct: true },
          { text: 'Three times the prize money plus $8 equals $20.', correct: false },
          { text: 'One-third of $8 plus x equals $20.', correct: false },
          { text: 'Prize divided by 8 plus 3 equals $20.', correct: false },
        ],
        explanation: 'x/3+8=20: a third of x plus $8 = $20.',
      },
      {
        equation: '2(x + 3) + 4 = 20',
        options: [
          { text: '2 boxes each with x items at $1 each + $3 label per box, plus $4 flat shipping. Total = $20.', correct: true },
          { text: '2 boxes at x dollars each with $3 and $4 added as flat fees. Total = $20.', correct: false },
          { text: '3 boxes with x items each plus $4. Total = $20.', correct: false },
          { text: '2 boxes at $3 each plus 4x. Total = $20.', correct: false },
        ],
        explanation: '2(x+3)+4=20: bracket handles per-box cost; the +4 is an extra flat shipping fee.',
      },
      {
        equation: '9x + 5 = 4x + 30',
        options: [
          { text: 'Plumber A: 9 hours at x dollars/hr + $5 trip fee. Plumber B: 4 hours at x dollars/hr + $30 trip fee. Same total.', correct: true },
          { text: 'Plumber A: 4 hours at x dollars/hr + $5 trip fee. Plumber B: 9 hours at x dollars/hr + $30 trip fee.', correct: false },
          { text: 'Plumber A: 9 hours at $30/hr. Plumber B: 4 hours at $5/hr.', correct: false },
          { text: 'Plumber A: 9 hours at $5/hr. Plumber B: 4 hours at $30/hr.', correct: false },
        ],
        explanation: '9x+5=4x+30: more hours vs higher trip fee — they balance out at some x.',
      },
      {
        equation: '6(x + 4) - 6 = 42',
        options: [
          { text: '6 boxes each costing x+4 dollars, then a $6 coupon deducted. Total = $42.', correct: true },
          { text: '6 boxes at x dollars each, plus $4 and minus $6. Total = $42.', correct: false },
          { text: '6 boxes at $4 each plus $42.', correct: false },
          { text: '6 boxes at $6 each plus 4x. Total = $42.', correct: false },
        ],
        explanation: '6(x+4)-6=42: bracket gives per-box cost, then one $6 coupon is removed at the end.',
      },
      {
        equation: '3x + 4 = 2(x + 5)',
        options: [
          { text: 'Plan A: 3 months at x dollars/mo + $4 setup. Plan B: 2 payments of (x+5) dollars each. Same total.', correct: true },
          { text: 'Plan A: 2 months at x dollars/mo + $4. Plan B: 3 payments of (x+5) each.', correct: false },
          { text: 'Plan A: 3 months at $4/mo. Plan B: 2 payments at $5 each.', correct: false },
          { text: 'Plan A: 3x + 4 dollars total. Plan B: 2x dollars + 5.', correct: false },
        ],
        explanation: '3x+4=2(x+5)=2x+10: two different payment structures that turn out equal.',
      },
      {
        equation: '3(x + 2) = 2(x + 6)',
        options: [
          { text: '3 bags each at (x+2) dollars. 2 larger bags each at (x+6) dollars. Same total cost.', correct: true },
          { text: '3 bags at x dollars each plus $2 tax. 2 bags at $6 each.', correct: false },
          { text: '3 bags at $2 each equal 2 bags at $6 each.', correct: false },
          { text: '2 bags each at (x+2) dollars. 3 bags each at (x+6) dollars.', correct: false },
        ],
        explanation: '3(x+2)=2(x+6): two bundle deals with different quantities and per-item extras that cost the same.',
      },
      {
        equation: '5x + 2(x + 4) = 50',
        options: [
          { text: 'Ali buys 5 items at x dollars each and 2 items at (x+4) dollars each. Total = $50.', correct: true },
          { text: 'Ali buys 5 items at x dollars each plus 2 flat fees of $4. Total = $50.', correct: false },
          { text: 'Ali buys 7 items at x dollars each plus $4. Total = $50.', correct: false },
          { text: 'Ali buys 5 items at $4 each plus 2x. Total = $50.', correct: false },
        ],
        explanation: '5x+2(x+4)=5x+2x+8=7x+8=50: 5 standard items + 2 premium items at (x+4) each.',
      },
    ],
  },
];

const QUESTION_HINTS = {
  '2x + 10 = 50': 'Tip: the number in front of x = quantity of items. The stand-alone number = flat fee.',
  '3x + 5 = 20': 'Tip: 3x means 3 things at x dollars each. The +5 is a flat add-on, not per item.',
  '4x + 8 = 40': 'Tip: coefficient of x = quantity; the constant = extra one-time charge.',
  '5x + 15 = 65': 'Tip: 5x means 5 items. The 15 is a one-time deposit, not per item.',
  '6x + 12 = 60': 'Tip: 6x means 6 identical things. The +12 is a service charge paid once.',
  'x + 25 = 100': 'Tip: just one unknown amount x. The 25 is already there; together they reach 100.',
  '7x + 3 = 38': 'Tip: 7 items at x dollars each, plus $3 one-off tax = $38 total.',
  '2x + 20 = 80': 'Tip: 2 items at x each, plus a flat $20 fee (not per item).',
  '9x + 1 = 28': 'Tip: nine items at x each. The $1 is a single packing charge.',
  '3x + 9 = 30': 'Tip: coefficient 3 = quantity. Constant 9 = flat delivery.',
  '4x + 4 = 20': 'Tip: 4 items at x each. The separate +4 is a one-time tax.',
  '10x + 5 = 55': 'Tip: 10 items at x each; $5 fee added once at checkout.',
  '5x - 10 = 40': 'Tip: subtraction = something was taken OFF (discount/coupon), not added on.',
  '4x - 8 = 24': 'Tip: the minus sign means money is removed. Think coupon or rebate, not shipping.',
  '6x - 6 = 30': 'Tip: -6 reduces the final bill. A delivery fee would be +6, not -6.',
  '3x - 12 = 15': 'Tip: subtract means a discount was applied AFTER buying 3 items.',
  '7x - 14 = 56': 'Tip: the -14 is a saving (discount card), not an extra cost.',
  '2x - 4 = 10': 'Tip: minus means money off. A discount fits; a tip adds money.',
  '8x - 16 = 48': 'Tip: -16 is a rebate. Delivery would add, not subtract.',
  '5x - 20 = 30': 'Tip: promotional discount = subtraction. DLC fee = addition. Which is this?',
  '9x - 9 = 63': 'Tip: -9 reduces the cost. A store credit does that; a gift-wrap fee would add.',
  '10x - 30 = 70': 'Tip: bulk discount reduces total cost, which maps to subtraction.',
  '4x - 20 = 40': 'Tip: sale discount subtracts from price, not adds like an assembly fee.',
  '6x - 30 = 12': 'Tip: -30 removes money. A group discount fits; a deposit would be added.',
  '3x - 6 = 18': 'Tip: clearance discount takes money off. Packaging fee adds money.',
  '11x - 11 = 77': 'Tip: -11 is money removed (rebate). Shipping would appear as +11.',
  '2x - 14 = 20': 'Tip: seasonal discount subtracts. Installation charge would add.',
  '6x + 12 = 48': 'Tip: the number multiplying x tells you how many were ordered.',
  '2x + 16 = 50': 'Tip: the constant not attached to x is the extra fee.',
  'x + 30 = 75': 'Tip: when no coefficient, x is just x. The constant is what was added.',
  '7x + 7 = 56': 'Tip: the lone constant is the gift-wrap fee, separate from the item price.',
  '9x + 18 = 90': 'Tip: the total is always on the right of the equals sign.',
  '3x + 21 = 51': 'Tip: how many times does x appear? That coefficient is the quantity.',
  '8x + 4 = 68': 'Tip: the +4 is the bag cost, a constant not multiplied by x.',
  '5x + 25 = 100': 'Tip: the constant in the equation matches the customisation charge.',
  '4x + 12 = 36': 'Tip: the delivery charge is the constant; the quantity is the coefficient.',
  '6x + 6 = 42': 'Tip: coefficient of x = number of packs. +6 = recycling fee.',
  '10x + 20 = 120': 'Tip: the total is on the right; the constant is the assembly fee.',
  '2x + 40 = 80': 'Tip: the constant 40 is the delivery fee, not multiplied by x.',
  '11x + 11 = 99': 'Tip: coefficient 11 = how many journals. Constant 11 = the fee.',
  '7x + 14 = 70': 'Tip: the tax is the constant (14), not the price per item.',
  '3x + 18 = 45': 'Tip: the total is the number on the right of the equals sign.',
  '2(x + 5) = 30': 'Tip: brackets mean the extra charge is PER ITEM, not a flat one-time fee.',
  '3(x + 4) = 33': 'Tip: the +4 is inside the bracket, so it applies to each of the 3 shirts.',
  '4(x + 3) = 28': 'Tip: bracket = cost of one item = (x + extra). Then multiply by quantity.',
  '5(x + 2) = 35': 'Tip: 5 x (x + 2) means five items, each costing x plus $2 extra.',
  '6(x + 1) = 42': 'Tip: the $1 inside the bracket is added to each item, not charged once.',
  '2(x + 10) = 50': 'Tip: $10 processing is per ticket (inside bracket), not a flat booking fee.',
  '3(x + 7) = 36': 'Tip: the $7 visor is part of each helmet price; it multiplies with 3.',
  '4(x + 6) = 48': 'Tip: warranty is per laptop, inside bracket. Flat delivery would be outside.',
  '5(x + 8) = 60': 'Tip: the patch cost is inside the bracket, applied to each cap.',
  '7(x + 2) = 63': 'Tip: per-item gift-wrap is inside bracket. Flat gift-wrap would be outside.',
  '3(x + 9) = 45': 'Tip: the $9 pot is included in each plant price, that is why it is inside.',
  '6(x + 5) = 60': 'Tip: vase is per-flower, multiply with 6 inside the bracket.',
  '4(x + 10) = 80': 'Tip: personalisation per jersey is inside the bracket, multiplied by 4.',
  '2(x + 15) = 70': 'Tip: the $15 fee is per watch, it lives inside the bracket.',
  '8(x + 3) = 56': 'Tip: wick upgrade is per candle. Packaging once would be outside.',
  '5(x + 6) = 55': 'Tip: each jar costs x + $6 lid. That (x+6) is then multiplied by 5.',
  '9(x + 4) = 72': 'Tip: cover upgrade per notebook is inside bracket, then x9.',
  '3(x + 12) = 51': 'Tip: cushion is per chair (inside). Flat upholstery would be outside.',
  '6(x + 8) = 96': 'Tip: per-ball personalisation makes (x+8) the unit price; multiply by 6.',
  '7(x + 5) = 84': 'Tip: engraving per cup is inside bracket. A flat fee would be added after.',
  '3x + 10 = 2x + 25': 'Tip: left side = one person total; right side = another. Match coefficients to quantities.',
  '5x + 4 = 3x + 20': 'Tip: the coefficient of x on each side tells you how many each plan includes.',
  '4x + 6 = x + 24': 'Tip: left side has 4 items; right side has 1 item. Match the larger coefficient.',
  '6x + 5 = 2x + 29': 'Tip: which side has more monthly charges vs a higher joining fee?',
  '7x + 2 = 4x + 17': 'Tip: more km but small toll OR fewer km but big toll, both cost the same.',
  '2x + 30 = 5x + 6': 'Tip: fewer km with high base fare equals more km with low base fare.',
  '8x + 1 = 3x + 26': 'Tip: left = high hourly rate + tiny bonus. Right = low hourly rate + big bonus.',
  '9x + 0 = 4x + 35': 'Tip: left side has no flat fee (0). Right side has a $35 bonus added.',
  '3x + 15 = 6x + 3': 'Tip: shorter subscription + large setup equals longer subscription + small setup.',
  '10x + 5 = 7x + 20': 'Tip: more km + cheap parking = fewer km + expensive parking.',
  '4x + 18 = x + 30': 'Tip: left is 4 sessions + small fee. Right is 1 session + big fee.',
  '5x + 7 = 2x + 22': 'Tip: more bikes + small helmet fee = fewer bikes + large helmet fee.',
  '6x + 9 = 3x + 27': 'Tip: 6 sessions cheap kit equals 3 sessions pricey kit.',
  '11x + 3 = 6x + 28': 'Tip: more data + tiny activation = less data + big activation.',
  '7x + 14 = 2x + 39': 'Tip: more crops + low irrigation = fewer crops + high irrigation.',
  '3x + 20 = 8x + 5': 'Tip: fewer items + big late fee = more items + small late fee.',
  '9x + 6 = 4x + 31': 'Tip: more hours + cheap setup = fewer hours + expensive setup.',
  '2x + 50 = 7x + 10': 'Tip: fewer paintings + high gallery fee = more paintings + low gallery fee.',
  '12x + 0 = 4x + 40': 'Tip: left side has zero flat fee. Right side has a $40 bonus.',
  '5x + 12 = 2x + 33': 'Tip: more sessions + small admin = fewer sessions + large admin.',
  '6x + 18 = x + 48': 'Tip: 6 rides + low gate fee = 1 ride + high gate fee.',
  '4x + 22 = 9x + 2': 'Tip: fewer items + big equipment = more items + tiny equipment.',
  '5(x - 2) = 40': 'Tip: the minus inside the bracket means EACH item gets the discount, not just once.',
  '3(x - 4) = 18': 'Tip: -4 inside the bracket means each of the 3 bags got a $4 discount.',
  '4(x - 3) = 20': 'Tip: bracket means the markdown applies per item, not as one flat deduction.',
  '2x + 3x = 50': 'Tip: two separate terms with x represent two different income sources.',
  'x/2 + 5 = 15': 'Tip: x/2 means HALF of x. Which story has only half?',
  '2(3x + 1) = 20': 'Tip: think of (3x+1) as what is inside one box, then multiplied by 2 boxes.',
  '6x - 2x = 32': 'Tip: subtract to find what remains, like made minus defective.',
  '5x + 3 = 3x + 13': 'Tip: left = one shop total; right = another. Match coefficients to quantities.',
  '4(x + 7) = 60': 'Tip: the $7 holder is per candle (inside bracket), not a flat delivery fee.',
  '3x - 2x + 10 = 25': 'Tip: 3x earned minus 2x spent = x net. Then add $10 savings.',
  '7(x - 1) = 42': 'Tip: the -1 inside the bracket means each scarf individually gets $1 off.',
  'x/3 + 8 = 20': 'Tip: x/3 means one-third of x. Which story divides x by 3?',
  '2(x + 3) + 4 = 20': 'Tip: the (x+3) bracket is per-box cost. The +4 after is a separate flat fee.',
  '9x + 5 = 4x + 30': 'Tip: left = one contractor (more hours, cheaper materials). Right = the other.',
  '8(x - 5) = 24': 'Tip: -5 per cookie inside bracket = per-cookie discount, not one flat deduction.',
  '4x + x = 45': 'Tip: 4x + x = 5x. Two separate income streams that add together.',
  '6(x + 4) - 6 = 42': 'Tip: bracket is per-box cost; the -6 after the bracket is one coupon at checkout.',
  '3x + 2x + 10 = 60': 'Tip: 3x + 2x = 5x. Two income sources combine; +10 is a bonus added once.',
  '10(x - 4) = 60': 'Tip: -4 per ticket inside bracket means each ticket is individually discounted.',
  '7x + 8 = 2x + 33': 'Tip: left = more days, cheaper materials. Right = fewer days, pricier materials.',
  'x/4 + 10 = 25': 'Tip: x/4 = one quarter of x. Add $10 to get $25.',
  '4(2x + 3) = 44': 'Tip: each bundle contains (2x+3). Four bundles total 44.',
  '11x - 3x = 64': 'Tip: 11x made minus 3x refunded = 8x net revenue.',
  '5(x + 10) = 75': 'Tip: the $10 processing fee is INSIDE the bracket, per ticket, not flat.',
  '3x + 4 = 2(x + 5)': 'Tip: left = plan A (linear). Right = plan B (bracket). Both total the same.',
  '6x - 12 + 2x = 36': 'Tip: combine like terms first: 6x+2x=8x. Then 8x-12=36.',
  '9(x - 3) + 9 = 63': 'Tip: bracket handles per-shoe discount; the +9 outside is flat shipping.',
  '4x - 3 = 2x + 11': 'Tip: left = more eggs with a coupon (minus). Right = fewer eggs with a premium (plus).',
  '3(x + 2) = 2(x + 6)': 'Tip: both sides have brackets. Match each bracket to the per-item cost of each bundle.',
  '5x + 2(x + 4) = 50': 'Tip: 5x = 5 standard items. 2(x+4) = 2 premium items, each at (x+4).',
};


// ─── Shuffle helper ──────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a shuffled copy of a module's questions.
// Level 1 (moduleIdx 0) keeps its original question order (conceptual sequence)
// but still shuffles the options per question to prevent answer-position memorisation.
function buildShuffled(moduleIdx) {
  const questions = MODULES[moduleIdx].questions;
  const ordered = moduleIdx === 0 ? [...questions] : shuffle(questions);
  return ordered.map(q => ({
    ...q,
    options: shuffle(q.options),
  }));
}

// ─── Algorithmic question generator ─────────────────────────────────────────
// Used by the Custom Test. Each generator picks random integers, builds
// an equation string, generates 4 shuffled options, and writes an explanation.

const GN = ['Riya', 'Aman', 'Priya', 'Sana', 'Tom', 'Maya', 'Leo', 'Nina', 'Dev', 'Kira', 'Jake', 'Lily', 'Sam', 'Uma', 'Ray', 'Ava', 'Ben', 'Zara', 'Ali', 'Mia'];
const GI = ['books', 'pens', 'notebooks', 'shirts', 'mugs', 'toys', 'bags', 'candles', 'plants', 'tickets', 'helmets', 'jerseys', 'caps', 'cups', 'lamps', 'jars', 'brushes'];
const GF = ['delivery fee', 'tax', 'shipping charge', 'service fee', 'packing charge', 'booking fee', 'handling fee'];
const GD = ['discount', 'rebate', 'coupon', 'sale markdown', 'promotional offer', 'loyalty discount'];
const GX = ['engraving fee', 'personalisation charge', 'cover upgrade', 'gift-wrap per item', 'customisation fee', 'warranty fee'];

function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function gp(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Template 1: ax + b = c
function gen1() {
  const a = ri(2, 9), x = ri(3, 15), b = ri(2, 40);
  const c = a * x + b;
  const nm = gp(GN), it = gp(GI), fe = gp(GF);
  return {
    equation: `${a}x + ${b} = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x dollars each and paid a $${b} ${fe}. Total = $${c}.`, correct: true },
      { text: `${nm} bought ${b} ${it} at x dollars each. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at $${b} each. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${c} ${it} at x dollars each. Total = $${b}.`, correct: false },
    ]),
    explanation: `${a}x + ${b} = ${c}: ${a} ${it} at x each (${a}x), plus $${b} flat ${fe} = $${c} total.`,
  };
}

// Template 2: ax - b = c  (discount)
function gen2() {
  const a = ri(2, 9), x = ri(4, 15), b = ri(2, 30);
  const c = a * x - b;
  if (c <= 0) return gen2();
  const nm = gp(GN), it = gp(GI), di = gp(GD), fe = gp(GF);
  return {
    equation: `${a}x - ${b} = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x dollars each and received a $${b} ${di}. Final total = $${c}.`, correct: true },
      { text: `${nm} bought ${a} ${it} at x dollars each and paid a $${b} ${fe}. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at x dollars each with a $${b} ${di} per item. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${b} ${it} at x dollars each and received a $${a} ${di}. Total = $${c}.`, correct: false },
    ]),
    explanation: `${a}x − ${b} = ${c}: the −${b} is a ${di} (subtraction = money off, not added on).`,
  };
}

// Template 3: a(x + b) = c  (per-item extra in bracket)
function gen3() {
  const a = ri(2, 7), b = ri(2, 15), x = ri(3, 12);
  const c = a * (x + b);
  const nm = gp(GN), it = gp(GI), ex = gp(GX), fe = gp(GF);
  return {
    equation: `${a}(x + ${b}) = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x dollars each with a $${b} ${ex}. Total = $${c}.`, correct: true },
      { text: `${nm} bought ${a} ${it} at x dollars each with a flat $${b} ${fe}. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${b} ${it} at x dollars each. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at $${b} each. Total = $${c}.`, correct: false },
    ]),
    explanation: `${a}(x+${b})=${c}: the $${b} ${ex} is inside the bracket — it applies per item, multiplied by ${a}.`,
  };
}

// Template 4: a(x - b) = c  (per-item discount in bracket)
function gen4() {
  const a = ri(2, 7), b = ri(2, 10), x = ri(b + 3, 18);
  const c = a * (x - b);
  if (c <= 0) return gen4();
  const nm = gp(GN), it = gp(GI), di = gp(GD), fe = gp(GF);
  return {
    equation: `${a}(x - ${b}) = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x dollars each with a $${b} ${di} per item. Total = $${c}.`, correct: true },
      { text: `${nm} bought ${a} ${it} at x dollars each with a flat $${b} ${di}. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${b} ${it} at x dollars each. Total = $${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at $${b} each. Total = $${c}.`, correct: false },
    ]),
    explanation: `${a}(x−${b})=${c}: the $${b} ${di} is inside the bracket, applied per item (×${a}), not just once.`,
  };
}

// Template 5: ax + b = cx + d  (variables on both sides)
function gen5() {
  const a = ri(4, 10), c = ri(1, a - 2), x = ri(2, 12), d = ri(5, 50);
  const b = c * x + d - a * x;
  if (b <= 0) return gen5();
  let n1 = gp(GN), n2 = gp(GN);
  while (n2 === n1) n2 = gp(GN);
  const it = gp(GI), f1 = gp(GF), f2 = gp(GF);
  return {
    equation: `${a}x + ${b} = ${c}x + ${d}`,
    options: shuffle([
      { text: `${n1} buys ${a} ${it} at x dollars each + $${b} ${f1}. ${n2} buys ${c} ${it} at x dollars each + $${d} ${f2}. Both bills are equal.`, correct: true },
      { text: `${n1} buys ${c} ${it} at x dollars each + $${b} ${f1}. ${n2} buys ${a} ${it} at x dollars each + $${d} ${f2}. Both bills are equal.`, correct: false },
      { text: `${n1} buys ${a} ${it} at $${b} each. ${n2} buys ${c} ${it} at $${d} each.`, correct: false },
      { text: `${n1} buys ${a} ${it} at x dollars each + $${d} ${f1}. ${n2} buys ${c} ${it} at x dollars each + $${b} ${f2}. Both bills are equal.`, correct: false },
    ]),
    explanation: `${a}x+${b}=${c}x+${d}: left = ${n1}'s bill (${a} items + $${b}); right = ${n2}'s bill (${c} items + $${d}). Equal at x=${x}.`,
  };
}

// Template 6: x/a + b = c  (division)
function gen6() {
  const a = gp([2, 3, 4, 5]);
  const b = ri(2, 25);
  const xOverA = ri(3, 18);
  const c = xOverA + b;
  const nm = gp(GN);
  const fw = { 2: 'Half', 3: 'One-third', 4: 'One-quarter', 5: 'One-fifth' };
  const ft = { 2: 'half', 3: 'one-third', 4: 'one-quarter', 5: 'one-fifth' };
  return {
    equation: `x/${a} + ${b} = ${c}`,
    options: shuffle([
      { text: `${fw[a]} of ${nm}'s savings plus $${b} pocket money equals $${c}.`, correct: true },
      { text: `${a} times ${nm}'s savings plus $${b} equals $${c}.`, correct: false },
      { text: `${nm}'s savings divided by ${b} plus ${a} equals $${c}.`, correct: false },
      { text: `${fw[a]} of $${c} minus $${b} equals ${nm}'s savings.`, correct: false },
    ]),
    explanation: `x/${a}+${b}=${c}: x/${a} is ${ft[a]} of x. Add $${b} to get $${c} total.`,
  };
}

// Template 7: ax + bx = c  (like terms / two income sources)
function gen7() {
  const a = ri(3, 8), b = ri(1, a - 1), x = ri(3, 12);
  const c = (a + b) * x;
  const nm = gp(GN);
  const s1 = gp(['tutoring', 'freelancing', 'morning shifts', 'a side gig']);
  const s2 = gp(['evening shifts', 'part-time work', 'a weekend gig', 'consulting']);
  return {
    equation: `${a}x + ${b}x = ${c}`,
    options: shuffle([
      { text: `${nm} earns ${a}x dollars from ${s1} and ${b}x dollars from ${s2}. Total income = $${c}.`, correct: true },
      { text: `${nm} earns $${a} per hour for x hours and spends ${b}x dollars. Net = $${c}.`, correct: false },
      { text: `${nm} earns ${a + b} dollars on x different days. Total = $${c}.`, correct: false },
      { text: `${nm} earns ${a}x from ${s1} and gives ${b}x away. Amount kept = $${c}.`, correct: false },
    ]),
    explanation: `${a}x + ${b}x = ${a + b}x = ${c}: two income streams in terms of x combine to give $${c}.`,
  };
}

const TEMPLATES = [gen1, gen1, gen1, gen2, gen2, gen3, gen4, gen5, gen5, gen6, gen7];
// gen1 appears 3× and gen5 2× so the mix stays realistic; brackets/both-sides are proportionally represented.

function generateCustomTest(n) {
  const qs = [];
  for (let i = 0; i < n; i++) {
    qs.push(gp(TEMPLATES)());
  }
  return qs;
}

const CUSTOM_MODULE = { id: 'custom', title: 'Custom Test', color: '#c084fc', subtitle: 'Algorithmically generated questions' };

// ─── Kids Story Quest UI Palette ─────────────────────────────────────────────
const PAL = { grape: '#9c85ff', mango: '#e8823c', berry: '#ff6f83', leaf: '#4fae7a', sky: '#5fc3f0' };
const MOD_COLORS = ['#fbbf24', '#9c85ff', '#a78bfa', '#34d399', '#f59e0b', '#f87171', '#fb923c', '#c084fc'];
const getTimerMax = (moduleIdx) => {

  // Easy levels (1, 2, 3 -> index 0, 1, 2): 45s
  // Hard levels (4, 5, 6 -> index 3, 4, 5 & custom): 60s (1 minute)
  if (moduleIdx === 'custom') return 60;
  if (typeof moduleIdx === 'number' && moduleIdx >= 3) return 60;
  return 45;
};
const TIMER_MAX = 45;


// ─── Shared CSS (Baloo 2 + animations) ───────────────────────────────────────
const SQ_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&display=swap');
  .sq-root { font-family: 'Baloo 2', system-ui, sans-serif !important; }
  .sq-root * { box-sizing: border-box; }
  @keyframes sq-pop  { 50% { transform: scale(1.18); } }
  @keyframes sq-hop  { 50% { transform: translateY(-10px) rotate(-8deg); } }
  @keyframes sq-up   { to  { transform: translateY(-70px); opacity: 0; } }
  @keyframes sq-fall { to  { transform: translateY(105vh) rotate(600deg); opacity: .9; } }
  @keyframes sq-fade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .sq-ans:hover:not(:disabled) { transform: translateY(-3px) !important; }
  .sq-card:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(0,0,0,.13) !important; }
  .sq-mascot-happy { animation: sq-hop .5s; }
  .sq-confetti { position:fixed; top:-20px; width:10px; height:16px; border-radius:3px; pointer-events:none; z-index:999; animation: sq-fall 2.4s linear forwards; }
  .sq-float { position:fixed; font-weight:800; font-size:26px; color:#4fae7a; pointer-events:none; animation: sq-up 1s ease-out forwards; z-index:1000; }
`;

// ─── Handmade Interactive Levels ──────────────────────────────────────────────
const HTML_LEVELS = [
  {
    parts: [{ t: '2x', c: 0 }, { t: '+', s: 1 }, { t: '10', c: 1 }, { t: '=', s: 1 }, { t: '50', c: 2 }],
    story: [
      { txt: 'Kavya bought' }, { need: '2x', fill: '2 sketchbooks costing x dollars each' }, { txt: 'then she paid' },
      { need: '10', fill: '$10 express delivery' }, { txt: 'and in total' }, { need: '50', fill: '$50 total bill' }
    ],
    chips: [
      { v: '10', e: '🚚', t: '$10 express delivery' }, { v: '50', e: '🧾', t: '$50 total bill' },
      { v: 'x', e: '✏️', t: '5 free pencils' }, { v: '2x', e: '🎨', t: '2 sketchbooks costing x dollars each' }
    ],
    q: 'What is the price of ONE sketchbook (x)?',
    opts: ['$10', '$20', '$25', '$30'],
    ans: 1,
    why: '2 sketchbooks = $40 ($20 each), plus $10 delivery = $50. So x = $20 ✅'
  },
  {
    parts: [{ t: '3x', c: 0 }, { t: '+', s: 1 }, { t: '5', c: 1 }, { t: '=', s: 1 }, { t: '20', c: 2 }],
    story: [
      { txt: 'Zane collected' }, { need: '3x', fill: '3 prize boxes with x tickets each' }, { txt: 'and added' },
      { need: '5', fill: '5 bonus tickets' }, { txt: 'making' }, { need: '20', fill: '20 tickets in all' }
    ],
    chips: [
      { v: '20', e: '🏆', t: '20 tickets in all' }, { v: '3x', e: '🎟️', t: '3 prize boxes with x tickets each' },
      { v: 'x', e: '👾', t: '1 arcade pass' }, { v: '5', e: '✨', t: '5 bonus tickets' }
    ],
    q: 'How many tickets are in ONE prize box (x)?',
    opts: ['3', '5', '6', '15'],
    ans: 1,
    why: '3 boxes = 15 tickets (5 each), plus 5 = 20 tickets. So x = 5 ✅'
  },
  {
    parts: [{ t: '4x', c: 0 }, { t: '−', s: 1 }, { t: '2', c: 1 }, { t: '=', s: 1 }, { t: '14', c: 2 }],
    story: [
      { txt: 'Tariq harvested' }, { need: '4x', fill: '4 baskets with x peaches each' }, { txt: 'he lost' },
      { need: '2', fill: '2 peaches on the path' }, { txt: 'and was left with' }, { need: '14', fill: '14 peaches left' }
    ],
    chips: [
      { v: '4x', e: '🍑', t: '4 baskets with x peaches each' }, { v: '14', e: '🧺', t: '14 peaches left' },
      { v: 'x', e: '🐝', t: '3 honeybees' }, { v: '2', e: '❌', t: '2 peaches on the path' }
    ],
    q: 'How many peaches were in ONE basket (x)?',
    opts: ['3', '4', '5', '7'],
    ans: 1,
    why: '4 baskets = 16 peaches (4 each), lose 2 = 14 peaches. So x = 4 ✅'
  }
];

const UNIQUE_NAMES = [
  'Kavya', 'Zane', 'Tariq', 'Freya', 'Dev', 'Ananya', 'Nico', 'Chloe',
  'Rohan', 'Ines', 'Mateo', 'Diya', 'Ethan', 'Suki', 'Kai', 'Noor',
  'Bhavya', 'Liam', 'Soraya', 'Ezra', 'Yuki', 'Vihaan', 'Kira', 'Zayd',
  'Elena', 'Kabir', 'Zoe', 'Advait', 'Callum', 'Siddharth', 'Aarav', 'Maya'
];

const THEMES = [
  { item: 'sketchbooks', unit: 'sketchbook', emoji: '🎨', feeEmoji: '🚚', feeText: 'delivery fee', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'board games', unit: 'board game', emoji: '🎲', feeEmoji: '🎁', feeText: 'gift wrapping', discEmoji: '💸', totalEmoji: '🧾' },
  { item: 'science kits', unit: 'science kit', emoji: '🔬', feeEmoji: '📦', feeText: 'lab packing fee', discEmoji: '🎫', totalEmoji: '🧾' },
  { item: 'solar lanterns', unit: 'solar lantern', emoji: '🏮', feeEmoji: '⚡', feeText: 'battery setup', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'robotic kits', unit: 'robotic kit', emoji: '🤖', feeEmoji: '⚙️', feeText: 'assembly fee', discEmoji: '🎟️', totalEmoji: '🧾' },
  { item: 'music albums', unit: 'album', emoji: '🎵', feeEmoji: '🎧', feeText: 'headset charge', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'pizza boxes', unit: 'pizza box', emoji: '🍕', feeEmoji: '🛵', feeText: 'express delivery', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'comic books', unit: 'comic book', emoji: '📚', feeEmoji: '🛡️', feeText: 'protective sleeve', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'plant pots', unit: 'plant pot', emoji: '🪴', feeEmoji: '🪴', feeText: 'potting soil fee', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'telescopes', unit: 'telescope', emoji: '🔭', feeEmoji: '✨', feeText: 'lens calibration', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'magic potions', unit: 'potion', emoji: '🧪', feeEmoji: '✨', feeText: 'crystal vial fee', discEmoji: '🏷️', totalEmoji: '🧾' },
  { item: 'treasure chests', unit: 'chest', emoji: '💎', feeEmoji: '🗝️', feeText: 'golden key fee', discEmoji: '🏷️', totalEmoji: '🧾' },
];

function solveX(eq) {
  try {
    const std = eq.match(/^(\d*)x\s*([+\-−])\s*(\d+)\s*=\s*(\d+)$/i);
    if (std) {
      const coeff = parseInt(std[1] || '1', 10);
      const isMinus = std[2] === '-' || std[2] === '−';
      const c = parseInt(std[3], 10);
      const rhs = parseInt(std[4], 10);
      const target = isMinus ? rhs + c : rhs - c;
      return Math.round(target / coeff);
    }
    const mult = eq.match(/^(\d*)x\s*=\s*(\d+)$/i);
    if (mult) {
      const coeff = parseInt(mult[1] || '1', 10);
      const rhs = parseInt(mult[2], 10);
      return Math.round(rhs / coeff);
    }
  } catch (e) { }
  return null;
}

function getInteractiveQuestion(rawQ, qIdx = 0) {
  if (!rawQ) return HTML_LEVELS[0];
  if (rawQ.parts && rawQ.story && rawQ.chips) return rawQ;

  const name = UNIQUE_NAMES[qIdx % UNIQUE_NAMES.length];
  const theme = THEMES[qIdx % THEMES.length];

  const eq = rawQ.equation || '2x + 10 = 50';
  const cleanEq = eq.replace('?', 'x').trim();

  const stdMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)$/i);
  const multMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*=\s*(\d+)$/i);
  const bracketMatch = cleanEq.match(/^(\d+)\((x|y|a|n)\s*([+\-−])\s*(\d+)\)\s*=\s*(\d+)$/i);
  const bothSidesMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)\s*=\s*(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)$/i);
  const combineMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d*x|\d*y|\d*a|\d*n)\s*=\s*(\d+)$/i);
  const fracMatch = cleanEq.match(/^([a-z])\/(\d+)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)$/i);
  const bracketCoeffMatch = cleanEq.match(/^(\d+)\((\d+[a-z])\s*([+\-−])\s*(\d+)\)\s*=\s*(\d+)$/i);

  let parts = [];
  let story = [];
  let chips = [];

  const correctOpt = rawQ.options?.find(o => o.correct) || rawQ.options?.[0];
  const storyText = correctOpt ? correctOpt.text : '';

  if (stdMatch) {
    const [, term1, op, term2, total] = stdMatch;
    const isMinus = op === '-' || op === '−';
    const num = term1.replace(/\D/g, '') || '1';

    parts = [
      { t: term1, c: 0 },
      { t: isMinus ? '−' : '+', s: 1 },
      { t: term2, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];

    const phrase1 = `${num} ${theme.item} at x dollars each`;
    const phrase2 = isMinus ? `$${term2} discount coupon` : `$${term2} ${theme.feeText}`;
    const phrase3 = `$${total} total bill`;

    story = [
      { txt: `${name} bought` },
      { need: term1, fill: phrase1 },
      { txt: isMinus ? 'applied a' : 'and paid' },
      { need: term2, fill: phrase2 },
      { txt: 'making the total' },
      { need: total, fill: phrase3 }
    ];

    const distractorSign = isMinus
      ? `$${term2} ${theme.feeText} added`
      : `$${term2} discount coupon`;

    const distractorPerItem = isMinus
      ? `$${term2} discount on EACH ${theme.unit}`
      : `$${term2} ${theme.feeText} on EACH ${theme.unit}`;

    const distractorSwap = `${term2} ${theme.item} at x dollars each`;

    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: term2, e: isMinus ? theme.discEmoji : theme.feeEmoji, t: phrase2 },
      { v: total, e: theme.totalEmoji, t: phrase3 },
      { v: 'err_sign', e: isMinus ? theme.feeEmoji : theme.discEmoji, t: distractorSign, err: isMinus ? `Notice the minus sign (−${term2})! A fee ADDS money (+), but a discount SUBTRACTS money (−)!` : `Notice the plus sign (+${term2})! A discount takes money off (−), but a fee ADDS money (+)!` },
      { v: 'err_per_item', e: '🏷️', t: distractorPerItem, err: `$${term2} per ${theme.unit} would be written with brackets as ${num}(x ${isMinus ? '−' : '+'} ${term2})! Here it's a flat one-off ${isMinus ? 'discount' : 'fee'}.` },
      { v: 'err_swap', e: theme.emoji, t: distractorSwap, err: `Look at ${term1} — the quantity of ${theme.item} multiplying x is ${num}, not ${term2}!` }
    ];
  } else if (bothSidesMatch) {
    const [, term1, op1, term2, term3, op2, term4] = bothSidesMatch;
    const isMinus1 = op1 === '-' || op1 === '−';
    const isMinus2 = op2 === '-' || op2 === '−';
    const num1 = term1.replace(/\D/g, '') || '1';
    const num3 = term3.replace(/\D/g, '') || '1';

    parts = [
      { t: term1, c: 0 },
      { t: isMinus1 ? '−' : '+', s: 1 },
      { t: term2, c: 1 },
      { t: '=', s: 1 },
      { t: term3, c: 0 },
      { t: isMinus2 ? '−' : '+', s: 1 },
      { t: term4, c: 2 }
    ];

    const name1 = name;
    const name2 = UNIQUE_NAMES[(qIdx + 1) % UNIQUE_NAMES.length];

    const phrase1 = `${name1} buys ${num1} ${theme.item} at x dollars each`;
    const phrase2 = isMinus1 ? `$${term2} discount coupon` : `$${term2} ${theme.feeText}`;
    const phrase3 = `${name2} buys ${num3} ${theme.item} at x dollars each`;
    const phrase4 = isMinus2 ? `$${term4} discount coupon` : `$${term4} ${theme.feeText}`;

    story = [
      { txt: `${name1}:` },
      { need: term1, fill: phrase1 },
      { txt: isMinus1 ? 'applied a' : 'and paid' },
      { need: term2, fill: phrase2 },
      { txt: 'equals' },
      { txt: `${name2}:` },
      { need: term3, fill: phrase3 },
      { txt: isMinus2 ? 'applied a' : 'and paid' },
      { need: term4, fill: phrase4 }
    ];

    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: term2, e: isMinus1 ? theme.discEmoji : theme.feeEmoji, t: phrase2 },
      { v: term3, e: theme.emoji, t: phrase3 },
      { v: term4, e: isMinus2 ? theme.discEmoji : theme.feeEmoji, t: phrase4 },
      { v: 'err_swap_qty', e: theme.emoji, t: `${name1} buys ${num3} ${theme.item} at x dollars each`, err: `Look at ${name1}'s term (${term1}) — ${name1} buys ${num1} ${theme.item}, not ${num3}!` },
      { v: 'err_swap_fee', e: '🏷️', t: `$${term4} ${theme.feeText} for ${name1}`, err: `${name1}'s side on the left has $${term2}, so ${name1}'s ${theme.feeText} is $${term2}, not $${term4}!` },
      { v: 'err_sign', e: isMinus1 ? theme.feeEmoji : theme.discEmoji, t: isMinus1 ? `$${term2} ${theme.feeText} for ${name1}` : `$${term2} discount for ${name1}`, err: isMinus1 ? `Notice the minus sign (−${term2}) for ${name1}! A fee ADDS money (+), but a discount SUBTRACTS money (−)!` : `Notice the plus sign (+${term2}) for ${name1}! A discount takes money off (−), but a fee ADDS money (+)!` }
    ];
  } else if (multMatch) {
    const [, term1, total] = multMatch;
    const num = term1.replace(/\D/g, '') || '1';
    parts = [
      { t: term1, c: 0 },
      { t: '=', s: 1 },
      { t: total, c: 1 }
    ];
    const phrase1 = `${num} ${theme.item} at x dollars each`;
    const phrase2 = `$${total} in total`;
    story = [
      { txt: `${name} ordered` },
      { need: term1, fill: phrase1 },
      { txt: 'totaling' },
      { need: total, fill: phrase2 }
    ];
    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: total, e: theme.totalEmoji, t: phrase2 },
      { v: 'err_swap', e: theme.emoji, t: `${total} ${theme.item} at x dollars each`, err: `Look at ${term1} — the quantity of ${theme.item} is ${num}, not ${total}!` },
      { v: 'err_const', e: '🏷️', t: `${num} ${theme.item} at $${total} each`, err: `$${total} is the total bill on the right of the equals sign (=), not the price per item!` }
    ];
  } else if (bracketMatch) {
    const [, mult, varN, op, val, total] = bracketMatch;
    const isMinus = op === '-' || op === '−';
    const bracketTerm = `(${varN} ${isMinus ? '−' : '+'} ${val})`;
    parts = [
      { t: mult, c: 0 },
      { t: bracketTerm, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];
    const phrase1 = `${mult} gift bundles`;
    const phrase2 = `(${varN} ${isMinus ? 'minus' : 'plus'} $${val} per ${theme.unit})`;
    const phrase3 = `$${total} altogether`;
    story = [
      { txt: `${name} prepared` },
      { need: mult, fill: phrase1 },
      { txt: 'each containing' },
      { need: bracketTerm, fill: phrase2 },
      { txt: 'for total' },
      { need: total, fill: phrase3 }
    ];
    chips = [
      { v: mult, e: '🎁', t: phrase1 },
      { v: bracketTerm, e: theme.emoji, t: phrase2 },
      { v: total, e: theme.totalEmoji, t: phrase3 },
      { v: 'err_flat', e: '🏷️', t: `flat $${val} fee added once`, err: `The term is inside brackets (${bracketTerm}), meaning it applies to EACH item, not just once!` },
      { v: 'err_sign', e: theme.emoji, t: `(${varN} ${isMinus ? 'plus' : 'minus'} $${val} per ${theme.unit})`, err: `Notice the operator inside the bracket is ${op}! Check the sign (+ vs −) carefully.` }
    ];
  } else if (combineMatch) {
    const [, term1, op, term2, total] = combineMatch;
    const isMinus = op === '-' || op === '−';
    const num1 = term1.replace(/\D/g, '') || '1';
    const num2 = term2.replace(/\D/g, '') || '1';
    parts = [
      { t: term1, c: 0 },
      { t: isMinus ? '−' : '+', s: 1 },
      { t: term2, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];
    const phrase1 = `${name} earned ${term1} in morning shifts`;
    const phrase2 = isMinus ? `${term2} lost to defective units` : `${term2} earned in evening shifts`;
    const phrase3 = `$${total} total earnings`;
    story = [
      { txt: `${name}:` },
      { need: term1, fill: phrase1 },
      { txt: isMinus ? 'minus' : 'plus' },
      { need: term2, fill: phrase2 },
      { txt: 'equals' },
      { need: total, fill: phrase3 }
    ];
    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: term2, e: isMinus ? theme.discEmoji : theme.feeEmoji, t: phrase2 },
      { v: total, e: theme.totalEmoji, t: phrase3 },
      { v: 'err_const', e: '🏷️', t: `$${num1} flat morning bonus`, err: `${term1} contains x, meaning it depends on x, not a flat $${num1}!` },
      { v: 'err_swap', e: theme.emoji, t: `${num2}x earned in morning shifts`, err: `First term is ${term1}, not ${term2}!` }
    ];
  } else if (fracMatch) {
    const [, varN, denom, op, val, total] = fracMatch;
    const isMinus = op === '-' || op === '−';
    const fracTerm = `${varN}/${denom}`;
    parts = [
      { t: fracTerm, c: 0 },
      { t: isMinus ? '−' : '+', s: 1 },
      { t: val, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];
    const phrase1 = `One-${denom === '2' ? 'half' : denom === '3' ? 'third' : denom + 'th'} of total (${fracTerm})`;
    const phrase2 = isMinus ? `$${val} coupon deducted` : `$${val} added`;
    const phrase3 = `$${total} total`;
    story = [
      { txt: `${name} has` },
      { need: fracTerm, fill: phrase1 },
      { txt: isMinus ? 'minus' : 'plus' },
      { need: val, fill: phrase2 },
      { txt: 'totaling' },
      { need: total, fill: phrase3 }
    ];
    chips = [
      { v: fracTerm, e: '🧪', t: phrase1 },
      { v: val, e: isMinus ? theme.discEmoji : theme.feeEmoji, t: phrase2 },
      { v: total, e: theme.totalEmoji, t: phrase3 },
      { v: 'err_mult', e: '📦', t: `${denom} full jars (${denom}x)`, err: `${fracTerm} means divided by ${denom}, not ${denom} times x!` },
      { v: 'err_swap', e: '🏷️', t: `${val} full jars`, err: `${val} is the flat amount added, not the fraction term!` }
    ];
  } else if (bracketCoeffMatch) {
    const [, mult, innerTerm, op, val, total] = bracketCoeffMatch;
    const isMinus = op === '-' || op === '−';
    const bracketTerm = `(${innerTerm} ${isMinus ? '−' : '+'} ${val})`;
    parts = [
      { t: mult, c: 0 },
      { t: bracketTerm, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];
    const phrase1 = `${mult} boxes`;
    const phrase2 = `(${innerTerm} ${isMinus ? 'minus' : 'plus'} $${val} per box)`;
    const phrase3 = `$${total} total cost`;
    story = [
      { txt: `${name} ordered` },
      { need: mult, fill: phrase1 },
      { txt: 'each containing' },
      { need: bracketTerm, fill: phrase2 },
      { txt: 'for total' },
      { need: total, fill: phrase3 }
    ];
    chips = [
      { v: mult, e: '📦', t: phrase1 },
      { v: bracketTerm, e: theme.emoji, t: phrase2 },
      { v: total, e: theme.totalEmoji, t: phrase3 },
      { v: 'err_sign', e: theme.emoji, t: `(${innerTerm} ${isMinus ? 'plus' : 'minus'} $${val} per box)`, err: `Notice the operator inside the bracket is ${op}! Check the sign (+ vs −) carefully.` }
    ];
  } else {
    const eqParts = cleanEq.split('=').map(s => s.trim());
    const leftSide = eqParts[0] || cleanEq;
    const rightSide = eqParts[1] || '0';
    parts = [
      { t: leftSide, c: 0 },
      { t: '=', s: 1 },
      { t: rightSide, c: 1 }
    ];
    const phrase1 = `${name}'s expression: ${leftSide}`;
    const phrase2 = `equals total: ${rightSide}`;
    story = [
      { txt: `${name}:` },
      { need: leftSide, fill: phrase1 },
      { txt: 'equals' },
      { need: rightSide, fill: phrase2 }
    ];
    chips = [
      { v: leftSide, e: theme.emoji, t: phrase1 },
      { v: rightSide, e: theme.totalEmoji, t: phrase2 },
      { v: 'err_swap', e: theme.emoji, t: `swapped total: ${leftSide}`, err: `Check the left side (${leftSide}) and right side (${rightSide}) of the equals sign (=)!` }
    ];
  }

  let qText = rawQ.prompt || `What is the price of ONE ${theme.unit} (x) in ${cleanEq}?`;
  let opts = [];
  let ans = 0;
  let why = rawQ.explanation || `Solving ${cleanEq} for ${name}'s ${theme.item}.`;

  if (rawQ.options && rawQ.options.length > 0) {
    opts = rawQ.options.map(o => o.text);
    ans = rawQ.options.findIndex(o => o.correct);
    if (ans < 0) ans = 0;
    why = rawQ.explanation || `Correct story match! ✅`;
    if (!rawQ.prompt) {
      qText = 'Pick the story that matches the equation:';
    }
  }

  return { parts, story, chips: shuffle(chips), q: qText, opts, ans, why };
}


// ─── Component ───────────────────────────────────────────────────────────────

export default function EquationToStory() {
  const [activeModule, setActiveModule] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  // Custom-test state
  const [customCount, setCustomCount] = useState(20);
  const [isCustomSetup, setIsCustomSetup] = useState(false);
  // Level progression
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [currentLevel, setCurrentLevel] = useState(0);
  // Kids UI state
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [fastWins, setFastWins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);
  const [mascotMsg, setMascotMsg] = useState({ text: 'Tip: <b>x</b> is the number we don\'t know yet!', cls: '' });
  const [mascotAnim, setMascotAnim] = useState(false);
  const [floats, setFloats] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const timerRef = useState(null);

  // Step 2 & Step 3 interaction state
  const dragValRef = useRef(null);
  const [filledSlots, setFilledSlots] = useState({});
  const [doneParts, setDoneParts] = useState(new Set());
  const [usedChips, setUsedChips] = useState(new Set());
  const [selectedChip, setSelectedChip] = useState(null);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState(new Set());

  const currentQ = useMemo(() => getInteractiveQuestion(shuffledQuestions[qIndex], qIndex), [shuffledQuestions, qIndex]);


  const module = activeModule === 'custom'
    ? CUSTOM_MODULE
    : activeModule !== null
      ? MODULES[activeModule]
      : null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const say = (text, cls = '') => {
    setMascotMsg({ text, cls });
    if (cls === 'ok') { setMascotAnim(false); setTimeout(() => setMascotAnim(true), 10); }
  };

  const addFloat = (n) => {
    const id = Date.now() + Math.random();
    setFloats(f => [...f, { id, n }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1000);
  };

  const fireConfetti = () => {
    const cols = [PAL.mango, PAL.grape, PAL.berry, PAL.leaf, PAL.sky];
    const pieces = Array.from({ length: 45 }, (_, i) => ({
      id: Date.now() + i, left: Math.random() * 100,
      color: cols[i % 5], delay: Math.random() * 0.7,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 3200);
  };

  const startTimer = (overrideModule = activeModule) => {
    if (timerRef[0]) clearInterval(timerRef[0]);
    const maxSecs = getTimerMax(overrideModule);
    setTimeLeft(maxSecs);
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          clearInterval(id);
          say('Time is up — no worries, keep going! ⏰', 'no');
          return 0;
        }
        return Math.round((t - 0.1) * 10) / 10;
      });
    }, 100);
    timerRef[0] = id;
  };

  const stopTimer = () => { if (timerRef[0]) clearInterval(timerRef[0]); };

  const resetQuestionState = () => {
    setFilledSlots({});
    setDoneParts(new Set());
    setUsedChips(new Set());
    setSelectedChip(null);
    setStoryCompleted(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setWrongAnswers(new Set());
    dragValRef.current = null;
  };

  const startModule = (idx) => {
    stopTimer();
    setActiveModule(idx);
    resetQuestionState();
    const rawQs = idx === 0 ? [...HTML_LEVELS, ...buildShuffled(idx)] : buildShuffled(idx);
    setShuffledQuestions(rawQs);
    setQIndex(0); setScore(0); setFinished(false); setWrongCount(0);
    setStreak(0); setBestStreak(0); setLives(3);
    setMistakes(0); setFastWins(0);
    setIsCustomSetup(false);
    if (typeof idx === 'number') setCurrentLevel(idx);
    say('Tip: <b>x</b> is the number we don\'t know yet!');
    setTimeout(() => startTimer(idx), 50);
  };


  const backToModules = () => {
    stopTimer();
    setActiveModule(null);
    setShuffledQuestions([]);
    setFinished(false);
    setIsCustomSetup(false);
    resetQuestionState();
  };

  const handleSlotFill = (need, fillVal, inputChipVal) => {
    // If slot is already filled, allow tapping to clear/unslot!
    if (filledSlots[need]) {
      const newSlots = { ...filledSlots };
      delete newSlots[need];
      setFilledSlots(newSlots);
      setDoneParts(prev => { const s = new Set(prev); s.delete(need); return s; });
      setUsedChips(prev => { const s = new Set(prev); s.delete(need); return s; });
      say('Slot cleared — pick a story piece to fill it again!', 'ok');
      return;
    }

    const chipVal = (typeof inputChipVal === 'string' && inputChipVal) ? inputChipVal : (dragValRef.current || selectedChip?.v);

    if (!chipVal) {
      say('Tap a story piece below first, then tap this blank! 👇', 'no');
      return;
    }

    if (chipVal === need) {
      const newSlots = { ...filledSlots, [need]: fillVal };
      setFilledSlots(newSlots);
      setDoneParts(prev => new Set([...prev, need]));
      setUsedChips(prev => new Set([...prev, chipVal]));

      addFloat(10);
      setScore(s => s + 10);
      say('Perfect match! That maths part now has a story ✅', 'ok');

      const currentQ = getInteractiveQuestion(shuffledQuestions[qIndex], qIndex);
      const required = currentQ.story.filter(s => s.need).map(s => s.need);
      const allDone = required.every(n => n === need || newSlots[n]);

      if (allDone) {
        setStoryCompleted(true);
        say('You built the whole story! Now solve it 🎯', 'ok');
      }
    } else {
      setMistakes(m => m + 1);
      setStreak(0);
      setLives(l => {
        const nextL = Math.max(0, l - 1);
        if (nextL === 0) {
          setTimeout(() => { setLives(3); say('Hearts refilled — keep going! 💚', 'ok'); }, 400);
        }
        return nextL;
      });
      const activeQ = getInteractiveQuestion(shuffledQuestions[qIndex], qIndex);
      const droppedChip = activeQ?.chips?.find(c => c.v === chipVal);
      const feedbackMsg = droppedChip?.err
        || (chipVal === 'x' || chipVal === 'wrong'
          ? 'That piece is not in the equation at all — look at the colours! 👀'
          : 'Oops! That piece does not fit this equation part. Read carefully! 💪');
      say(feedbackMsg, 'no');
    }

    setSelectedChip(null);
    dragValRef.current = null;
  };


  const handleAnswerSelect = (index, currentQ) => {
    if (answered || wrongAnswers.has(index)) return;

    if (index === currentQ.ans) {
      setSelectedAnswer(index);
      setAnswered(true);
      stopTimer();
      const bonus = Math.max(0, Math.round(timeLeft));
      const pts = 50 + bonus;
      setScore(s => s + pts);
      setStreak(s => { const n = s + 1; setBestStreak(b => Math.max(b, n)); return n; });
      if (timeLeft > 20) setFastWins(f => f + 1);
      addFloat(pts);
      fireConfetti();
      say(`${currentQ.why}  (+${bonus} speed bonus 🔥)`, 'ok');
      setTimeout(() => {
        next();
      }, 1900);
    } else {
      setWrongAnswers(prev => new Set([...prev, index]));
      setStreak(0);
      setMistakes(m => m + 1);
      setWrongCount(c => c + 1);
      setLives(l => {
        const n = Math.max(0, l - 1);
        if (n === 0) setTimeout(() => { setLives(3); say('Hearts refilled — keep going! 💚', 'ok'); }, 400);
        return n;
      });
      say('Not quite — reread carefully and try another option! 🤔', 'no');
    }
  };

  const next = () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      setFinished(true);
    } else {
      setQIndex(i => i + 1);
      resetQuestionState();
      say('Tip: <b>x</b> is the number we don\'t know yet!');
      startTimer();
    }
  };


  // ── Custom-test setup (count picker) ────────────────────────────────────
  if (activeModule === 'custom' && isCustomSetup) {
    return (
      <div className="sq-root" style={{ maxWidth: 480, margin: '0 auto', padding: '20px 0', textAlign: 'center' }}>
        <style>{SQ_STYLE}</style>
        <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>⚡</div>
        <h2 style={{ fontFamily: "'Baloo 2',system-ui,sans-serif", color: 'var(--clr-text)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0' }}>
          Custom Test
        </h2>
        <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: 32, lineHeight: 1.6 }}>
          Questions are generated algorithmically — the algorithm randomises the integer values
          from all equation types you have studied. Each run gives a fresh set.
        </p>

        <div style={{ background: 'var(--clr-surface)', border: '3px solid var(--clr-border)', borderRadius: 20, padding: '28px 32px', marginBottom: 28, boxShadow: '0 6px 0 rgba(0,0,0,0.07)' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-text-soft)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Number of Questions
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 14 }}>
            <button onClick={() => setCustomCount(c => Math.max(10, c - 5))}
              style={{ width: 40, height: 40, borderRadius: 10, border: '2px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-text)', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 800, fontFamily: "'Baloo 2',system-ui,sans-serif" }}>−</button>
            <span style={{ fontSize: '2.6rem', fontWeight: 800, color: PAL.grape, minWidth: 60, fontFamily: "'Baloo 2',system-ui,sans-serif" }}>{customCount}</span>
            <button onClick={() => setCustomCount(c => Math.min(100, c + 5))}
              style={{ width: 40, height: 40, borderRadius: 10, border: '2px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-text)', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 800, fontFamily: "'Baloo 2',system-ui,sans-serif" }}>+</button>
          </div>
          <input type="range" min={10} max={100} step={5} value={customCount}
            onChange={e => setCustomCount(Number(e.target.value))}
            style={{ width: '100%', accentColor: PAL.grape }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>
            <span>10</span><span>55</span><span>100</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          {[10, 20, 30, 50].map(n => (
            <button key={n} onClick={() => setCustomCount(n)} style={{
              padding: '7px 18px', borderRadius: 999, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
              background: customCount === n ? PAL.grape : 'transparent',
              border: `2px solid ${customCount === n ? PAL.grape : 'var(--clr-border)'}`,
              color: customCount === n ? '#fff' : 'var(--clr-text-soft)',
              fontFamily: "'Baloo 2',system-ui,sans-serif", transition: 'all 0.15s',
            }}>{n} Qs</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={backToModules}
            style={{ padding: '11px 22px', background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: 10, color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <button
            onClick={() => {
              setShuffledQuestions(generateCustomTest(customCount));
              setQIndex(0); setAnswered(false);
              setScore(0); setFinished(false); setWrongCount(0);
              setIsCustomSetup(false);
              resetQuestionState();
              startTimer('custom');
            }}
            style={{ padding: '11px 28px', background: CUSTOM_MODULE.color, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Start {customCount} Questions ⚡
          </button>
        </div>
      </div>
    );
  }

  // ── Level Selector (grid layout) ─────────────────────────────────────────
  if (activeModule === null) {
    return (
      <div className="sq-root" style={{ maxWidth: 820, margin: '0 auto', padding: '20px 0' }}>
        <style>{SQ_STYLE}</style>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Baloo 2',system-ui,sans-serif", color: 'var(--clr-text)', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, margin: '0 0 6px 0' }}>
            Equation to Story
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.6 }}>
            Turn equations into real stories — complete each level to unlock the next!
          </p>
        </div>


        {/* Level map dots strip */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          {MODULES.map((mod, idx) => {
            const isDone = completedLevels.has(idx);
            const isCurrent = idx === currentLevel;
            return (
              <div key={idx} onClick={() => startModule(idx)} style={{
                width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
                fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                background: isDone ? PAL.leaf : isCurrent ? PAL.sky : 'var(--clr-surface)',
                color: isDone || isCurrent ? '#fff' : 'var(--clr-text-soft)',
                border: `2px solid ${isDone ? '#17a389' : isCurrent ? '#1f9fd4' : 'var(--clr-border)'}`,
                transform: isCurrent ? 'scale(1.15)' : 'none',
                boxShadow: isCurrent ? `0 0 0 3px ${PAL.sky}44` : 'none',
                transition: 'transform 0.2s', fontFamily: "'Baloo 2',system-ui,sans-serif",
              }}>{isDone ? '✓' : idx + 1}</div>
            );
          })}
        </div>

        {/* Module cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 14, marginBottom: 20 }}>
          {MODULES.map((mod, idx) => {
            const isCurrent = idx === currentLevel;
            const isDone = completedLevels.has(idx);
            const accent = MOD_COLORS[idx] || PAL.grape;
            return (
              <button key={idx} className="sq-card"

                onClick={() => startModule(idx)}
                style={{
                  background: 'var(--clr-surface)',
                  border: isCurrent ? `2.5px solid ${accent}` : isDone ? `2.5px solid ${accent}55` : '2px solid var(--clr-border)',
                  borderRadius: 20, padding: '18px 18px 16px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  position: 'relative', minHeight: 110,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.06)', overflow: 'hidden',
                }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: accent, borderRadius: '20px 0 0 20px' }} />
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent }}>Level {idx + 1}</span>
                    {isDone && <span style={{ fontSize: '0.9rem', color: PAL.leaf }}>✓</span>}
                    {isCurrent && !isDone && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: PAL.sky, background: `${PAL.sky}22`, padding: '2px 8px', borderRadius: 999 }}>Current</span>}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--clr-text)', lineHeight: 1.25, marginBottom: 8, fontFamily: "'Baloo 2',system-ui,sans-serif" }}>{mod.title}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--clr-text-soft)' }}>{mod.questions.length} questions</div>
                </div>
              </button>
            );
          })}

          {/* Custom Test card */}
          <button className="sq-card"
            onClick={() => { setActiveModule('custom'); setIsCustomSetup(true); }}
            style={{
              background: 'var(--clr-surface)', border: `2px dashed ${PAL.grape}77`,
              borderRadius: 20, padding: '18px 18px 16px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'transform 0.18s, box-shadow 0.18s',
              minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 4px 0 rgba(0,0,0,0.06)', overflow: 'hidden', position: 'relative',
            }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: PAL.grape, borderRadius: '20px 0 0 20px' }} />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: PAL.grape }}>⚡ Custom</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)' }}>10–100 Qs</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--clr-text)', lineHeight: 1.25, marginBottom: 8, fontFamily: "'Baloo 2',system-ui,sans-serif" }}>Custom Test</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--clr-text-soft)' }}>Algorithm-generated</div>
            </div>
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: '0.77rem', color: 'var(--clr-text-soft)', flexWrap: 'wrap' }}>
          <span><span style={{ color: PAL.sky }}>● Current</span> — your active level</span>
          <span><span style={{ color: PAL.leaf }}>✓ Passed</span> — scored ≥80%</span>
        </div>
      </div>
    );
  }

  // ── Finished Screen ──────────────────────────────────────────────────────
  if (finished) {
    const total = shuffledQuestions.length;
    const correctCount = Math.round(score / 50); // base 50 pts per correct
    const realPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = realPct >= 80;
    const perfect = mistakes === 0 && correctCount === total;
    const stars = perfect ? 3 : realPct >= 80 ? 2 : 1;
    const isNumericModule = typeof activeModule === 'number';
    const nextLevelIdx = isNumericModule && activeModule < MODULES.length - 1 ? activeModule + 1 : null;

    if (passed && isNumericModule && !completedLevels.has(activeModule)) {
      setCompletedLevels(prev => new Set([...prev, activeModule]));
      if (nextLevelIdx !== null) setCurrentLevel(nextLevelIdx);
      setTimeout(fireConfetti, 100);
    }
    if (perfect) setTimeout(fireConfetti, 300);

    const badges = [
      { key: 'story', label: '📖 Story Builder', won: true },
      { key: 'fast', label: '⚡ Speed Star', won: fastWins >= Math.max(1, Math.ceil(total * 0.4)) },
      { key: 'streak', label: '🔥 Streak Hero', won: bestStreak >= 3 },
      { key: 'perfect', label: '💎 No Mistakes', won: perfect },
    ];

    return (
      <div className="sq-root" style={{ maxWidth: 560, margin: '0 auto', padding: '20px 0', textAlign: 'center' }}>
        <style>{SQ_STYLE}</style>
        {confetti.map(p => (
          <div key={p.id} className="sq-confetti" style={{ left: p.left + 'vw', background: p.color, animationDelay: p.delay + 's' }} />
        ))}

        <div style={{ background: 'var(--clr-surface)', border: '3px solid var(--clr-border)', borderRadius: 24, padding: '32px 24px', boxShadow: '0 10px 0 rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>{perfect ? '🏆' : passed ? '⭐' : '📖'}</div>
          <div style={{ fontSize: 'clamp(28px,7vw,44px)', letterSpacing: 6, marginBottom: 10 }}>
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <h2 style={{ fontFamily: "'Baloo 2',system-ui,sans-serif", color: 'var(--clr-text)', fontSize: 'clamp(1.3rem,4vw,1.8rem)', fontWeight: 800, margin: '0 0 6px' }}>
            {perfect ? 'Quest Complete — Perfect!' : passed ? 'Level Passed! 🎉' : 'Keep Practising 💪'}
          </h2>

          {isNumericModule && (
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: MOD_COLORS[activeModule] || PAL.grape, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Level {activeModule + 1} — {module.title}
            </div>
          )}

          <div style={{ fontSize: 'clamp(2rem,8vw,3rem)', fontWeight: 800, color: PAL.berry, margin: '10px 0 2px', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>{score}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: 16 }}>points earned</div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 999, marginBottom: 20,
            background: passed ? `${PAL.leaf}22` : `${PAL.berry}22`,
            border: `2px solid ${passed ? PAL.leaf : PAL.berry}55`,
            fontSize: '0.9rem', fontWeight: 700,
            color: passed ? PAL.leaf : PAL.berry,
            fontFamily: "'Baloo 2',system-ui,sans-serif",
          }}>
            {passed ? '✅ Passed!' : `❌ Need 80% — you got ${realPct}%`}
          </div>

          {/* Progress bar */}
          <div style={{ position: 'relative', width: '100%', height: 14, background: 'rgba(128,128,128,0.15)', borderRadius: 999, overflow: 'visible', marginBottom: 22, border: '2px solid var(--clr-border)' }}>
            <div style={{ width: `${realPct}%`, height: '100%', background: passed ? `linear-gradient(90deg,${PAL.leaf},${PAL.sky})` : `linear-gradient(90deg,${PAL.mango},${PAL.berry})`, borderRadius: 999, transition: 'width 0.6s ease' }} />
            <div style={{ position: 'absolute', top: -7, left: '80%', transform: 'translateX(-50%)', height: 26, width: 2, background: 'var(--clr-text-soft)', opacity: 0.35, borderRadius: 1 }} />
            <div style={{ position: 'absolute', top: -22, left: '80%', transform: 'translateX(-50%)', fontSize: '0.68rem', color: 'var(--clr-text-soft)', fontWeight: 700, whiteSpace: 'nowrap' }}>80% pass</div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
            {[
              { icon: '🔥', label: 'Best Streak', val: bestStreak },
              { icon: '⚡', label: 'Speed Wins', val: fastWins },
              { icon: '❤️', label: 'Lives Lost', val: 3 - lives < 0 ? 0 : 3 - lives },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--clr-surface)', border: '2px solid var(--clr-border)', borderRadius: 16, padding: '10px 14px', textAlign: 'center', minWidth: 74 }}>
                <div style={{ fontSize: '1.3rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--clr-text)', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>{stat.val}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 22 }}>
            {badges.map(b => (
              <div key={b.key} style={{
                background: b.won ? `${PAL.mango}22` : 'var(--clr-surface)',
                border: `2px ${b.won ? 'solid' : 'dashed'} ${b.won ? PAL.mango : 'var(--clr-border)'}`,
                borderRadius: 16, padding: '8px 14px', fontWeight: 800,
                opacity: b.won ? 1 : 0.35, fontSize: '0.88rem',
                fontFamily: "'Baloo 2',system-ui,sans-serif",
                color: 'var(--clr-text)',
                animation: b.won ? 'sq-pop 0.5s' : 'none',
              }}>{b.label}</div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {passed && nextLevelIdx !== null && (
              <button onClick={() => startModule(nextLevelIdx)} style={{
                padding: '12px 24px', background: PAL.leaf, border: 'none', borderRadius: 16,
                color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 5px 0 #17a389', fontFamily: "'Baloo 2',system-ui,sans-serif",
              }}>Next Level {nextLevelIdx + 1} ➤</button>
            )}
            <button onClick={() => startModule(activeModule)} style={{
              padding: '12px 24px', background: module.color || PAL.mango, border: 'none', borderRadius: 16,
              color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: `0 5px 0 ${PAL.mango}88`, fontFamily: "'Baloo 2',system-ui,sans-serif",
            }}>{passed ? 'Play Again 🔄' : 'Try Again 💪'}</button>
            <button onClick={backToModules} style={{
              padding: '12px 24px', background: 'transparent',
              border: '2px solid var(--clr-border)', borderRadius: 16,
              color: 'var(--clr-text-soft)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              fontFamily: "'Baloo 2',system-ui,sans-serif",
            }}>All Levels</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Screen (Interactive Story Quest UI) ─────────────────────────────
  const timerMax = getTimerMax(activeModule);
  const timerPct = (timeLeft / timerMax) * 100;


  const COLS = [PAL.grape, PAL.mango, PAL.berry];

  return (
    <div className="sq-root" style={{ maxWidth: 680, margin: '0 auto', padding: '16px 0' }}>
      <style>{SQ_STYLE}</style>

      {/* Confetti & Floating +pts */}
      {confetti.map(p => (
        <div key={p.id} className="sq-confetti" style={{ left: p.left + 'vw', background: p.color, animationDelay: p.delay + 's' }} />
      ))}
      {floats.map(f => (
        <div key={f.id} className="sq-float" style={{ right: 60, top: 80 }}>+{f.n}</div>
      ))}

      {/* ── Top Header with Back Button ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={backToModules} style={{
          background: 'var(--clr-surface)', border: '2.5px solid var(--clr-border)',
          borderRadius: 14, padding: '7px 16px', fontSize: '0.9rem', fontWeight: 800,
          cursor: 'pointer', color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 0 rgba(0,0,0,0.06)', fontFamily: "'Baloo 2',system-ui,sans-serif",
        }}>
          ← All Levels
        </button>

        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text-soft)', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>
          <span style={{ color: module?.color || PAL.mango, fontWeight: 800 }}>
            {typeof activeModule === 'number' ? `Level ${activeModule + 1}: ${module?.title}` : module?.title || 'Custom Test'}
          </span>
        </div>
      </div>

      {/* ── HUD ── */}

      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        background: 'var(--clr-surface)', border: '3px solid var(--clr-border)', borderRadius: 20,
        padding: '8px 14px', boxShadow: '0 6px 0 rgba(0,0,0,0.07)', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 'clamp(14px,3vw,18px)', border: '2px solid var(--clr-border)', borderRadius: 999, padding: '4px 12px', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>
          ⭐ <span style={{ fontSize: '1.15rem' }}>{score}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 'clamp(14px,3vw,18px)', border: '2px solid var(--clr-border)', borderRadius: 999, padding: '4px 12px', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>
          🔥 <span style={{ fontSize: '1.15rem', color: streak >= 3 ? PAL.leaf : 'var(--clr-text)' }}>{streak}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 'clamp(14px,3vw,18px)', border: '2px solid var(--clr-border)', borderRadius: 999, padding: '4px 12px', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>
          ❤️ {'🟢'.repeat(lives) + '⚪'.repeat(3 - lives)}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {shuffledQuestions.map((_, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center',
              fontSize: '0.72rem', fontWeight: 800,
              background: i < qIndex ? PAL.leaf : i === qIndex ? PAL.sky : 'var(--clr-surface)',
              color: i <= qIndex ? '#fff' : 'var(--clr-text-soft)',
              border: `2px solid ${i < qIndex ? '#17a389' : i === qIndex ? '#1f9fd4' : 'var(--clr-border)'}`,
              transform: i === qIndex ? 'scale(1.15)' : 'none',
              fontFamily: "'Baloo 2',system-ui,sans-serif",
            }}>
              {i < qIndex ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* ── Energy / Timer bar ── */}
      <div style={{ height: 14, background: 'rgba(128,128,128,0.12)', borderRadius: 999, overflow: 'hidden', marginBottom: 16, border: '2px solid var(--clr-border)' }}>
        <div style={{
          width: `${timerPct}%`, height: '100%',
          background: timerPct > 40 ? `linear-gradient(90deg,${PAL.leaf},${PAL.sky})` : `linear-gradient(90deg,${PAL.mango},${PAL.berry})`,
          transition: 'width 0.1s linear', borderRadius: 999,
        }} />
      </div>

      {/* ── Main Game Card ── */}
      <div style={{
        background: 'var(--clr-surface)', border: '3px solid var(--clr-border)',
        borderRadius: 24, padding: '20px 22px', boxShadow: '0 10px 0 rgba(0,0,0,0.07)', marginBottom: 14,
      }}>
        {/* Step 1: Read the equation */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ background: PAL.grape, color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>1</span>
          <span style={{ fontSize: 'clamp(14px,3.2vw,19px)', fontWeight: 800, color: 'var(--clr-text)', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>
            Level {qIndex + 1} of {shuffledQuestions.length} — read the equation
          </span>
        </div>

        {/* Color-coded equation parts */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          {currentQ.parts.map((p, i) => {
            if (p.s) {
              return <span key={i} style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 800, opacity: 0.6 }}>{p.t}</span>;
            }
            const color = COLS[p.c % 3];
            const isDone = doneParts.has(p.t);
            return (
              <span key={i} style={{
                background: color, color: '#fff', padding: '8px 18px', borderRadius: 16,
                fontSize: 'clamp(20px,5.2vw,30px)', fontWeight: 800,
                boxShadow: '0 5px 0 rgba(0,0,0,0.15)', transition: '0.2s',
                outline: isDone ? `5px solid ${PAL.leaf}` : 'none',
                animation: isDone ? 'sq-pop 0.35s' : 'none',
                display: 'inline-block',
              }}>
                {p.t}
              </span>
            );
          })}
        </div>

        {/* Step 2: Drag/tap the story piece onto each colour */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ background: PAL.mango, color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>2</span>
          <span style={{ fontSize: 'clamp(14px,3.2vw,19px)', fontWeight: 800, color: 'var(--clr-text)', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>
            Drag or tap the story piece onto each colour
          </span>
        </div>

        {/* Story sentence with slots */}
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(15px,3.2vw,20px)', lineHeight: 2.1, textAlign: 'center', marginBottom: 16,
          fontFamily: "'Baloo 2',system-ui,sans-serif",
        }}>
          {currentQ.story.map((s, i) => {
            if (s.txt) return <span key={i}>{s.txt}</span>;

            const isFilled = !!filledSlots[s.need];
            const fillText = filledSlots[s.need];
            const partObj = currentQ.parts.find(p => p.t === s.need);
            const slotColor = COLS[(partObj ? partObj.c : 0) % 3];

            return (
              <span key={i}
                onDragOver={e => {
                  e.preventDefault();
                  try { e.dataTransfer.dropEffect = 'move'; } catch (err) { }
                  e.currentTarget.style.borderColor = PAL.sky;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onDragLeave={e => {
                  e.currentTarget.style.borderColor = isFilled ? slotColor : selectedChip ? PAL.sky : 'var(--clr-border)';
                  e.currentTarget.style.transform = 'none';
                }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = isFilled ? slotColor : 'var(--clr-border)';
                  e.currentTarget.style.transform = 'none';
                  let val = '';
                  try { val = e.dataTransfer.getData('text/plain'); } catch (err) { }
                  if (!val) val = dragValRef.current || selectedChip?.v;
                  handleSlotFill(s.need, s.fill, val);
                  dragValRef.current = null;
                }}
                onClick={() => handleSlotFill(s.need, s.fill)}
                style={{
                  minWidth: 140, minHeight: 52, borderRadius: 18,
                  border: isFilled ? `3px solid ${slotColor}` : selectedChip ? `3px dashed ${PAL.sky}` : '3px dashed var(--clr-border)',
                  background: isFilled ? slotColor : selectedChip ? `${PAL.sky}15` : 'var(--clr-surface)',
                  color: isFilled ? '#fff' : 'var(--clr-text)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '6px 14px', fontSize: 'clamp(13px,2.9vw,17px)', fontWeight: 800,
                  transition: 'all 0.15s', cursor: 'pointer',
                  boxShadow: isFilled ? `0 4px 0 ${slotColor}88` : selectedChip ? `0 0 12px ${PAL.sky}44` : 'none',
                }}
              >
                {isFilled ? fillText : <span style={{ opacity: 0.5, fontWeight: 600 }}>drop {s.need} here</span>}
              </span>
            );
          })}
        </div>

        {/* Tray of chips */}
        {!storyCompleted && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
            {currentQ.chips.map((chip, i) => {
              const isUsed = usedChips.has(chip.v);
              const isPicked = selectedChip?.v === chip.v;
              return (
                <div key={i}
                  draggable={!isUsed}
                  onDragStart={e => {
                    if (isUsed) return;
                    dragValRef.current = chip.v;
                    try {
                      e.dataTransfer.setData('text/plain', chip.v);
                      e.dataTransfer.effectAllowed = 'move';
                    } catch (err) { }
                    setSelectedChip(chip);
                  }}
                  onClick={() => {
                    if (isUsed) return;
                    if (isPicked) {
                      setSelectedChip(null);
                      say('Selection cancelled');
                    } else {
                      setSelectedChip(chip);
                      say(`Selected "${chip.t}" — now tap the blank where this belongs! 👇`, 'ok');
                    }
                  }}
                  style={{
                    cursor: isUsed ? 'default' : 'grab', userSelect: 'none',
                    background: 'var(--clr-surface)',
                    border: isPicked ? `3px solid ${PAL.sky}` : '3px solid var(--clr-border)',
                    borderRadius: 20, padding: '9px 14px',
                    fontSize: 'clamp(13px,2.9vw,17px)', fontWeight: 800,
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: isPicked ? `0 0 0 4px ${PAL.sky}44` : '0 5px 0 rgba(0,0,0,0.07)',
                    opacity: isUsed ? 0.25 : 1, pointerEvents: isUsed ? 'none' : 'auto',
                    transform: isPicked ? 'scale(1.05)' : 'none',
                    transition: 'all 0.15s',
                    fontFamily: "'Baloo 2',system-ui,sans-serif",
                  }}
                >
                  <span style={{ fontSize: 24 }}>{chip.e}</span>
                  <span>{chip.t}</span>
                </div>
              );
            })}
          </div>
        )}


        {/* Mascot Fox speech bubble */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
          <div className={mascotAnim ? 'sq-mascot-happy' : ''} style={{ fontSize: 34, transition: '0.2s', flexShrink: 0 }}>
            {mascotMsg.cls === 'no' ? '🙀' : '🦊'}
          </div>
          <div style={{
            background: mascotMsg.cls === 'ok' ? `${PAL.leaf}18` : mascotMsg.cls === 'no' ? `${PAL.berry}18` : 'var(--clr-surface)',
            border: `3px solid ${mascotMsg.cls === 'ok' ? PAL.leaf : mascotMsg.cls === 'no' ? PAL.berry : 'var(--clr-border)'}`,
            borderRadius: 18, padding: '8px 14px', fontWeight: 700,
            fontSize: 'clamp(13px,2.9vw,17px)', maxWidth: 640, minHeight: 24,
            color: mascotMsg.cls === 'ok' ? PAL.leaf : mascotMsg.cls === 'no' ? PAL.berry : 'var(--clr-text)',
            fontFamily: "'Baloo 2',system-ui,sans-serif",
          }} dangerouslySetInnerHTML={{ __html: mascotMsg.text }} />
        </div>

        {/* Step 3 / Story Options Choice */}
        {(storyCompleted || (currentQ.opts && currentQ.opts.length > 0)) && (
          <div style={{ marginTop: 18, animation: 'sq-fade 0.3s ease-out' }}>
            {storyCompleted && (
              <div style={{
                background: `${PAL.leaf}18`, border: `3px solid ${PAL.leaf}`,
                borderRadius: 20, padding: 14, fontSize: 'clamp(14px,3vw,19px)',
                textAlign: 'center', fontWeight: 700, color: PAL.leaf, marginBottom: 16,
                fontFamily: "'Baloo 2',system-ui,sans-serif",
              }}>
                📖 “{currentQ.story.map(s => s.txt || s.fill).join(' ')}.”
              </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ background: PAL.berry, color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>
                {storyCompleted ? '3' : '2'}
              </span>
              <span style={{ fontSize: 'clamp(15px,3.2vw,20px)', fontWeight: 800, color: 'var(--clr-text)', fontFamily: "'Baloo 2',system-ui,sans-serif" }}>
                {currentQ.q}
              </span>
            </div>

            {/* Answer buttons grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: currentQ.opts.some(o => o.length > 20) ? '1fr' : 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 12, marginBottom: 10
            }}>
              {currentQ.opts.map((optText, i) => {
                const isGood = answered && i === currentQ.ans;
                const isBad = wrongAnswers.has(i);
                let bg = 'var(--clr-surface)';
                let borderColor = 'var(--clr-border)';
                let color = 'var(--clr-text)';

                if (isGood) {
                  bg = `${PAL.leaf}22`; borderColor = PAL.leaf; color = PAL.leaf;
                } else if (isBad) {
                  bg = `${PAL.berry}22`; borderColor = PAL.berry; color = PAL.berry;
                }

                const isLong = optText.length > 20;

                return (
                  <button key={i} className="sq-ans"
                    disabled={answered || isBad}
                    onClick={() => handleAnswerSelect(i, currentQ)}
                    style={{
                      cursor: answered || isBad ? 'default' : 'pointer',
                      border: `3px solid ${borderColor}`,
                      background: bg, color, borderRadius: 18, padding: isLong ? '12px 18px' : '14px',
                      textAlign: isLong ? 'left' : 'center',
                      fontSize: isLong ? 'clamp(14px,2.9vw,17px)' : 'clamp(18px,4.4vw,24px)',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      opacity: isBad ? 0.55 : 1,
                      transition: 'transform 0.15s, background 0.15s',
                      fontFamily: "'Baloo 2',system-ui,sans-serif",
                    }}
                  >
                    {isLong && <strong style={{ marginRight: 8, color: isBad ? PAL.berry : PAL.grape }}>{String.fromCharCode(65 + i)})</strong>}
                    {optText}
                    {isBad && <span style={{ marginLeft: 8, color: PAL.berry }}>❌</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



