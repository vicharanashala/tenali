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
    target: 15,
    questions: [
      {
        equation: '2x + 100 = 500',
        options: [
          { text: 'Riya bought 2 books costing x rupees each and paid ₹100 delivery. Total = ₹500.', correct: true },
          { text: 'Riya bought 100 books costing x rupees each. Total = ₹500.', correct: false },
          { text: 'Riya bought 2 books costing ₹100 each and the total was ₹500.', correct: false },
          { text: 'Riya bought 500 books costing x rupees each with ₹100 delivery.', correct: false },
        ],
        explanation: '2x (2 books at x each) + 100 (flat delivery) = 500 (total bill).',
      },
      {
        equation: '3x + 50 = 200',
        options: [
          { text: 'Aman bought 3 notebooks costing x rupees each and paid ₹50 delivery. Total = ₹200.', correct: true },
          { text: 'Aman bought 50 notebooks costing x rupees each. Total = ₹200.', correct: false },
          { text: 'Aman bought 3 notebooks costing ₹50 each and paid ₹200.', correct: false },
          { text: 'Aman bought 200 notebooks costing x rupees each with ₹50 fee.', correct: false },
        ],
        explanation: '3x (3 notebooks at x each) + 50 (delivery) = 200 (total).',
      },
      {
        equation: '4x + 80 = 400',
        options: [
          { text: 'Priya bought 4 pens at x rupees each and paid an ₹80 fee. Total = ₹400.', correct: true },
          { text: 'Priya bought 80 pens at x rupees each. Total = ₹400.', correct: false },
          { text: 'Priya bought 4 pens costing ₹80 each for ₹400 total.', correct: false },
          { text: 'Priya bought 400 pens at x rupees each with an ₹80 fee.', correct: false },
        ],
        explanation: '4x (4 pens at x each) + 80 (fee) = 400 (total).',
      },
      {
        equation: '5x + 150 = 650',
        options: [
          { text: 'Sana rented 5 bikes at x rupees per hour and paid a ₹150 deposit. Total = ₹650.', correct: true },
          { text: 'Sana rented 150 bikes at x rupees each. Total = ₹650.', correct: false },
          { text: 'Sana rented 5 bikes for ₹150 each. Total = ₹650.', correct: false },
          { text: 'Sana rented 650 bikes at x rupees each with a ₹150 deposit.', correct: false },
        ],
        explanation: '5x (5 bikes at x/hr) + 150 (deposit) = 650 (total).',
      },
      {
        equation: '6x + 120 = 600',
        options: [
          { text: 'Tom ordered 6 pizzas at x rupees each with a ₹120 service charge. Total = ₹600.', correct: true },
          { text: 'Tom ordered 120 pizzas at x rupees each. Total = ₹600.', correct: false },
          { text: 'Tom ordered 6 pizzas at ₹120 each. Total = ₹600.', correct: false },
          { text: 'Tom ordered 600 pizzas at x rupees each with a ₹120 charge.', correct: false },
        ],
        explanation: '6x (6 pizzas at x each) + 120 (service charge) = 600.',
      },
      {
        equation: 'x + 250 = 1000',
        options: [
          { text: 'Maya already had ₹250 saved and earned x more rupees. She now has ₹1000.', correct: true },
          { text: 'Maya earned x rupees and spent ₹250. She has ₹1000 left.', correct: false },
          { text: 'Maya earned ₹250 and x is how much she owes. Total debt = ₹1000.', correct: false },
          { text: 'Maya earned 1000 rupees and spent ₹250. Total left is x.', correct: false },
        ],
        explanation: 'x (unknown amount) + 250 (already saved) = 1000 (total).',
      },
      {
        equation: '7x + 30 = 380',
        options: [
          { text: 'Leo bought 7 stickers at x rupees each and paid ₹30 tax. Total = ₹380.', correct: true },
          { text: 'Leo bought 30 stickers at x rupees each. Total = ₹380.', correct: false },
          { text: 'Leo bought 7 stickers at ₹30 each. Total = ₹380.', correct: false },
          { text: 'Leo bought 380 stickers at x rupees each with ₹30 tax.', correct: false },
        ],
        explanation: '7x (7 stickers at x each) + 30 (tax) = 380 (total).',
      },
      {
        equation: '2x + 200 = 800',
        options: [
          { text: 'Nina bought 2 tickets at x rupees each and paid ₹200 booking fee. Total = ₹800.', correct: true },
          { text: 'Nina bought 200 tickets at x rupees each. Total = ₹800.', correct: false },
          { text: 'Nina bought 2 tickets at ₹200 each. Total = ₹800.', correct: false },
          { text: 'Nina bought 800 tickets at x rupees each with a ₹200 fee.', correct: false },
        ],
        explanation: '2x (2 tickets at x each) + 200 (booking fee) = 800 (total).',
      },
      {
        equation: '9x + 10 = 280',
        options: [
          { text: 'Dev bought 9 erasers at x rupees each and paid ₹10 packing charge. Total = ₹280.', correct: true },
          { text: 'Dev bought 10 erasers at x rupees each. Total = ₹280.', correct: false },
          { text: 'Dev bought 9 erasers at ₹10 each. Total = ₹280.', correct: false },
          { text: 'Dev bought 280 erasers at x rupees each with ₹10 packing.', correct: false },
        ],
        explanation: '9x (9 erasers at x each) + 10 (packing) = 280 (total).',
      },
      {
        equation: '3x + 90 = 300',
        options: [
          { text: 'Kira bought 3 candles at x rupees each and paid ₹90 delivery. Total = ₹300.', correct: true },
          { text: 'Kira bought 90 candles at x rupees each. Total = ₹300.', correct: false },
          { text: 'Kira bought 3 candles at ₹90 each. Total = ₹300.', correct: false },
          { text: 'Kira bought 300 candles at x rupees each with ₹90 delivery.', correct: false },
        ],
        explanation: '3x (3 candles at x each) + 90 (delivery) = 300 (total).',
      },
      {
        equation: '4x + 40 = 200',
        options: [
          { text: 'Jake bought 4 brushes at x rupees each plus a ₹40 tax. Total = ₹200.', correct: true },
          { text: 'Jake bought 4 brushes at ₹40 each. Total was ₹200.', correct: false },
          { text: 'Jake bought 200 brushes at x rupees each. Total = ₹40.', correct: false },
          { text: 'Jake bought 40 brushes at x rupees each with ₹4 tax.', correct: false },
        ],
        explanation: '4x (4 brushes at x each) + 40 (tax) = 200 (total).',
      },
      {
        equation: '10x + 50 = 550',
        options: [
          { text: 'Lily bought 10 stamps at x rupees each and paid a ₹50 envelope fee. Total = ₹550.', correct: true },
          { text: 'Lily bought 50 stamps at x rupees each. Total = ₹550.', correct: false },
          { text: 'Lily bought 10 stamps at ₹50 each. Total = ₹550.', correct: false },
          { text: 'Lily bought 550 stamps at x rupees each with ₹50 fee.', correct: false },
        ],
        explanation: '10x (10 stamps at x each) + 50 (envelope fee) = 550 (total).',
      },
      {
        equation: '8x + 60 = 460',
        options: [
          { text: 'Sam bought 8 folders at x rupees each and paid a ₹60 shipping fee. Total = ₹460.', correct: true },
          { text: 'Sam bought 60 folders at x rupees each. Total = ₹460.', correct: false },
          { text: 'Sam bought 8 folders at ₹60 each. Total = ₹460.', correct: false },
          { text: 'Sam bought 460 folders at x rupees each with ₹60 fee.', correct: false },
        ],
        explanation: '8x (8 folders at x each) + 60 (shipping) = 460 (total).',
      },
      {
        equation: '5x + 70 = 320',
        options: [
          { text: 'Zara bought 5 posters at x rupees each and paid a ₹70 tube fee. Total = ₹320.', correct: true },
          { text: 'Zara bought 70 posters at x rupees each. Total = ₹320.', correct: false },
          { text: 'Zara bought 5 posters at ₹70 each. Total = ₹320.', correct: false },
          { text: 'Zara bought 320 posters at x rupees each with ₹70 fee.', correct: false },
        ],
        explanation: '5x (5 posters at x each) + 70 (tube fee) = 320 (total).',
      },
      {
        equation: '6x + 40 = 280',
        options: [
          { text: 'Omer bought 6 badges at x rupees each and paid a ₹40 gift box fee. Total = ₹280.', correct: true },
          { text: 'Omer bought 40 badges at x rupees each. Total = ₹280.', correct: false },
          { text: 'Omer bought 6 badges at ₹40 each. Total = ₹280.', correct: false },
          { text: 'Omer bought 280 badges at x rupees each with ₹40 fee.', correct: false },
        ],
        explanation: '6x (6 badges at x each) + 40 (box fee) = 280 (total).',
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
        equation: '5x - 100 = 400',
        options: [
          { text: '5 pizzas at x rupees each with a ₹100 discount. Total = ₹400.', correct: true },
          { text: '5 pizzas at x rupees each with ₹100 delivery added. Total = ₹400.', correct: false },
          { text: '5 pizzas at x rupees each with a ₹100 discount per pizza. Total = ₹400.', correct: false },
          { text: '100 pizzas at x rupees each with a ₹50 discount. Total = ₹400.', correct: false },
        ],
        explanation: '5x - 100 = 400: multiply then subtract a flat ₹100 discount. Delivery adds ₹100 (5x + 100); per-pizza discount is 5(x - 100).',
      },
      {
        equation: '4x - 80 = 240',
        options: [
          { text: '4 shirts at x rupees each with an ₹80 coupon applied. Total = ₹240.', correct: true },
          { text: '4 shirts at x rupees each with ₹80 extra shipping added. Total = ₹240.', correct: false },
          { text: '4 shirts at x rupees each with an ₹80 coupon applied per shirt. Total = ₹240.', correct: false },
          { text: '80 shirts at x rupees each with a ₹40 coupon applied. Total = ₹240.', correct: false },
        ],
        explanation: '4x - 80 = 240: subtract ₹80 once for the coupon. Shipping adds ₹80 (4x + 80); per-shirt coupon is 4(x - 80).',
      },
      {
        equation: '6x - 60 = 300',
        options: [
          { text: '6 pens at x rupees each with a ₹60 rebate. Total = ₹300.', correct: true },
          { text: '6 pens at x rupees each with a ₹60 handling fee added. Total = ₹300.', correct: false },
          { text: '6 pens at x rupees each with a ₹60 rebate per pen. Total = ₹300.', correct: false },
          { text: '300 pens at x rupees each with a ₹60 rebate. Total = ₹300.', correct: false },
        ],
        explanation: '6x - 60 = 300: the ₹60 rebate is subtracted once from 6x. Handling fee adds ₹60 (6x + 60); per-pen rebate is 6(x - 60).',
      },
      {
        equation: '3x - 120 = 150',
        options: [
          { text: '3 bags at x rupees each after a ₹120 loyalty discount. Total = ₹150.', correct: true },
          { text: '3 bags at x rupees each with ₹120 gift-wrapping added. Total = ₹150.', correct: false },
          { text: '3 bags at x rupees each after a ₹120 discount per bag. Total = ₹150.', correct: false },
          { text: '120 bags at x rupees each after a ₹30 loyalty discount. Total = ₹150.', correct: false },
        ],
        explanation: '3x - 120 = 150: flat ₹120 loyalty discount subtracted from 3x. Gift-wrapping adds ₹120 (3x + 120); per-bag discount is 3(x - 120).',
      },
      {
        equation: '7x - 140 = 560',
        options: [
          { text: '7 notebooks at x rupees each with a ₹140 discount card. Total = ₹560.', correct: true },
          { text: '7 notebooks at x rupees each with ₹140 shipping added. Total = ₹560.', correct: false },
          { text: '7 notebooks at x rupees each with a ₹140 discount per notebook. Total = ₹560.', correct: false },
          { text: '140 notebooks at x rupees each with a ₹70 discount card. Total = ₹560.', correct: false },
        ],
        explanation: '7x - 140 = 560: ₹140 is subtracted once. Shipping adds ₹140 (7x + 140); per-notebook discount is 7(x - 140).',
      },
      {
        equation: '2x - 40 = 100',
        options: [
          { text: '2 cups of coffee at x rupees each after a ₹40 member discount. Total = ₹100.', correct: true },
          { text: '2 cups of coffee at x rupees each plus a ₹40 tip added. Total = ₹100.', correct: false },
          { text: '2 cups of coffee at x rupees each after a ₹40 discount per cup. Total = ₹100.', correct: false },
          { text: '40 cups of coffee at x rupees each after a ₹20 member discount. Total = ₹100.', correct: false },
        ],
        explanation: '2x - 40 = 100: member discount subtracts ₹40 flat. Tip adds ₹40 (2x + 40); per-cup discount is 2(x - 40).',
      },
      {
        equation: '8x - 160 = 480',
        options: [
          { text: '8 flowers at x rupees each with a ₹160 wholesale rebate. Total = ₹480.', correct: true },
          { text: '8 flowers at x rupees each with ₹160 delivery added. Total = ₹480.', correct: false },
          { text: '8 flowers at x rupees each with a ₹160 rebate per flower. Total = ₹480.', correct: false },
          { text: '160 flowers at x rupees each with an ₹80 wholesale rebate. Total = ₹480.', correct: false },
        ],
        explanation: '8x - 160 = 480: ₹160 rebate reduces total cost. Delivery adds ₹160 (8x + 160); per-flower rebate is 8(x - 160).',
      },
      {
        equation: '5x - 200 = 300',
        options: [
          { text: '5 games at x rupees each after a ₹200 promotional discount. Total = ₹300.', correct: true },
          { text: '5 games at x rupees each plus a ₹200 DLC fee added. Total = ₹300.', correct: false },
          { text: '5 games at x rupees each after a ₹200 discount per game. Total = ₹300.', correct: false },
          { text: '200 games at x rupees each after a ₹50 promotional discount. Total = ₹300.', correct: false },
        ],
        explanation: '5x - 200 = 300: promotional discount subtracts ₹200 flat. DLC fee adds ₹200 (5x + 200); per-game discount is 5(x - 200).',
      },
      {
        equation: '9x - 90 = 630',
        options: [
          { text: '9 mugs at x rupees each with a ₹90 store credit applied. Total = ₹630.', correct: true },
          { text: '9 mugs at x rupees each with a ₹90 gift-wrap fee added. Total = ₹630.', correct: false },
          { text: '9 mugs at x rupees each with a ₹90 store credit per mug. Total = ₹630.', correct: false },
          { text: '9 mugs costing ₹90 each with an x rupee credit applied. Total = ₹630.', correct: false },
        ],
        explanation: '9x - 90 = 630: store credit subtracts ₹90 flat. Gift-wrap adds ₹90 (9x + 90); per-mug credit is 9(x - 90).',
      },
      {
        equation: '10x - 300 = 700',
        options: [
          { text: '10 posters at x rupees each after a ₹300 bulk discount. Total = ₹700.', correct: true },
          { text: '10 posters at x rupees each with ₹300 frame fee added. Total = ₹700.', correct: false },
          { text: '10 posters at x rupees each after a ₹300 discount per poster. Total = ₹700.', correct: false },
          { text: '300 posters at x rupees each after a ₹100 bulk discount. Total = ₹700.', correct: false },
        ],
        explanation: '10x - 300 = 700: ₹300 bulk discount is subtracted once. Frame fee adds ₹300 (10x + 300); per-poster discount is 10(x - 300).',
      },
      {
        equation: '4x - 200 = 400',
        options: [
          { text: '4 chairs at x rupees each after a ₹200 sale discount. Total = ₹400.', correct: true },
          { text: '4 chairs at x rupees each with ₹200 assembly fee added. Total = ₹400.', correct: false },
          { text: '4 chairs at x rupees each after a ₹200 discount per chair. Total = ₹400.', correct: false },
          { text: '200 chairs at x rupees each after a ₹40 sale discount. Total = ₹400.', correct: false },
        ],
        explanation: '4x - 200 = 400: sale discount subtracts ₹200 flat. Assembly adds ₹200 (4x + 200); per-chair discount is 4(x - 200).',
      },
      {
        equation: '6x - 300 = 120',
        options: [
          { text: '6 bottles at x rupees each after a ₹300 group discount. Total = ₹120.', correct: true },
          { text: '6 bottles at x rupees each with ₹300 deposit added. Total = ₹120.', correct: false },
          { text: '6 bottles at x rupees each after a ₹300 discount per bottle. Total = ₹120.', correct: false },
          { text: '300 bottles at x rupees each after a ₹60 group discount. Total = ₹120.', correct: false },
        ],
        explanation: '6x - 300 = 120: group discount subtracts ₹300 once. Deposit adds ₹300 (6x + 300); per-bottle discount is 6(x - 300).',
      },
      {
        equation: '3x - 60 = 180',
        options: [
          { text: '3 scarves at x rupees each with a ₹60 clearance discount. Total = ₹180.', correct: true },
          { text: '3 scarves at x rupees each with ₹60 packaging fee added. Total = ₹180.', correct: false },
          { text: '3 scarves at x rupees each with a ₹60 clearance discount per scarf. Total = ₹180.', correct: false },
          { text: '60 scarves at x rupees each with a ₹30 clearance discount. Total = ₹180.', correct: false },
        ],
        explanation: '3x - 60 = 180: clearance discount subtracts ₹60 flat. Packaging adds ₹60 (3x + 60); per-scarf discount is 3(x - 60).',
      },
      {
        equation: '11x - 110 = 770',
        options: [
          { text: '11 canvases at x rupees each with an ₹110 member rebate. Total = ₹770.', correct: true },
          { text: '11 canvases at x rupees each with ₹110 shipping added. Total = ₹770.', correct: false },
          { text: '11 canvases at x rupees each with an ₹110 member rebate per canvas. Total = ₹770.', correct: false },
          { text: '11 canvases costing ₹110 each with an x rupee rebate applied. Total = ₹770.', correct: false },
        ],
        explanation: '11x - 110 = 770: member rebate subtracts ₹110 flat. Shipping adds ₹110 (11x + 110); per-canvas rebate is 11(x - 110).',
      },
      {
        equation: '2x - 140 = 200',
        options: [
          { text: '2 lamps at x rupees each after a ₹140 seasonal discount. Total = ₹200.', correct: true },
          { text: '2 lamps at x rupees each with ₹140 installation charge added. Total = ₹200.', correct: false },
          { text: '2 lamps at x rupees each after a ₹140 discount per lamp. Total = ₹200.', correct: false },
          { text: '140 lamps at x rupees each after a ₹20 seasonal discount. Total = ₹200.', correct: false },
        ],
        explanation: '2x - 140 = 200: seasonal discount subtracts ₹140 flat. Installation adds ₹140 (2x + 140); per-lamp discount is 2(x - 140).',
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
        equation: '4x + 80 = 400',
        prompt: 'Riya bought ____ books costing x rupees each and paid an ₹80 fee. Total = ₹400.',
        options: [
          { text: '2 books', correct: false },
          { text: '3 books', correct: false },
          { text: '4 books', correct: true },
          { text: '8 books', correct: false },
        ],
        explanation: '4x + 80 = 400 — the coefficient 4 tells us Riya bought 4 books.',
      },
      {
        equation: '3x + 60 = 240',
        prompt: 'Aman bought 3 pens at x rupees each. The ____ fee was ₹60. Total = ₹240.',
        options: [
          { text: '₹30 delivery', correct: false },
          { text: '₹60 delivery', correct: true },
          { text: '₹240 delivery', correct: false },
          { text: '₹120 delivery', correct: false },
        ],
        explanation: '3x + 60 = 240 — the constant 60 represents the ₹60 fee.',
      },
      {
        equation: '5x + 100 = 600',
        prompt: 'Sana bought 5 toys at x rupees each with a ₹100 tax. Total = ____.',
        options: [
          { text: '₹500', correct: false },
          { text: '₹550', correct: false },
          { text: '₹600', correct: true },
          { text: '₹700', correct: false },
        ],
        explanation: '5x + 100 = 600 — the right-hand side 600 is the total.',
      },
      {
        equation: '6x + 120 = 480',
        prompt: 'Tom ordered ____ juices at x rupees each with a ₹120 tray charge. Total = ₹480.',
        options: [
          { text: '4', correct: false },
          { text: '5', correct: false },
          { text: '6', correct: true },
          { text: '12', correct: false },
        ],
        explanation: '6x + 120 = 480 — coefficient 6 shows 6 juices were ordered.',
      },
      {
        equation: '2x + 160 = 500',
        prompt: 'Mia bought 2 jackets at x rupees each and paid ____ shipping. Total = ₹500.',
        options: [
          { text: '₹20', correct: false },
          { text: '₹80', correct: false },
          { text: '₹160', correct: true },
          { text: '₹500', correct: false },
        ],
        explanation: '2x + 160 = 500 — the constant 160 is the shipping charge.',
      },
      {
        equation: 'x + 300 = 750',
        prompt: 'Jake had x rupees. He found ____ more. Now he has ₹750.',
        options: [
          { text: '₹250', correct: false },
          { text: '₹300', correct: true },
          { text: '₹450', correct: false },
          { text: '₹750', correct: false },
        ],
        explanation: 'x + 300 = 750 — the constant 300 is what Jake found.',
      },
      {
        equation: '7x + 70 = 560',
        prompt: 'Lily bought 7 books at x rupees each with a ____ gift-wrap fee. Total = ₹560.',
        options: [
          { text: '₹50', correct: false },
          { text: '₹60', correct: false },
          { text: '₹70', correct: true },
          { text: '₹140', correct: false },
        ],
        explanation: '7x + 70 = 560 — the constant 70 is the gift-wrap fee.',
      },
      {
        equation: '9x + 180 = 900',
        prompt: 'Dev rented 9 bikes at x rupees per day with an ₹180 insurance fee. Total = ____.',
        options: [
          { text: '₹720', correct: false },
          { text: '₹800', correct: false },
          { text: '₹900', correct: true },
          { text: '₹1080', correct: false },
        ],
        explanation: '9x + 180 = 900 — the right-hand side 900 is the total.',
      },
      {
        equation: '3x + 210 = 510',
        prompt: 'Kira bought ____ scarves at x rupees each and paid a ₹210 tax. Total = ₹510.',
        options: [
          { text: '2', correct: false },
          { text: '3', correct: true },
          { text: '7', correct: false },
          { text: '21', correct: false },
        ],
        explanation: '3x + 210 = 510 — coefficient 3 means 3 scarves were bought.',
      },
      {
        equation: '8x + 40 = 680',
        prompt: 'Uma bought 8 notebooks at x rupees each. She also paid ____ for a bag. Total = ₹680.',
        options: [
          { text: '₹20', correct: false },
          { text: '₹40', correct: true },
          { text: '₹80', correct: false },
          { text: '₹680', correct: false },
        ],
        explanation: '8x + 40 = 680 — constant 40 is the bag cost.',
      },
      {
        equation: '5x + 250 = 1000',
        prompt: 'Ray bought 5 helmets at x rupees each. He paid ____ extra for customisation. Total = ₹1000.',
        options: [
          { text: '₹50', correct: false },
          { text: '₹200', correct: false },
          { text: '₹250', correct: true },
          { text: '₹1000', correct: false },
        ],
        explanation: '5x + 250 = 1000 — the constant 250 is the customisation charge.',
      },
      {
        equation: '4x + 120 = 360',
        prompt: 'Nina bought 4 mugs at x rupees each with a ____ delivery charge. Total = ₹360.',
        options: [
          { text: '₹40', correct: false },
          { text: '₹90', correct: false },
          { text: '₹120', correct: true },
          { text: '₹360', correct: false },
        ],
        explanation: '4x + 120 = 360 — constant 120 is the delivery charge.',
      },
      {
        equation: '6x + 60 = 420',
        prompt: 'Sam bought ____ packs at x rupees each with a ₹60 recycling fee. Total = ₹420.',
        options: [
          { text: '4', correct: false },
          { text: '5', correct: false },
          { text: '6', correct: true },
          { text: '7', correct: false },
        ],
        explanation: '6x + 60 = 420 — coefficient 6 means 6 packs were purchased.',
      },
      {
        equation: '10x + 200 = 1200',
        prompt: 'Ava bought 10 chairs at x rupees each. She paid ____ for assembly. Total = ₹1200.',
        options: [
          { text: '₹100', correct: false },
          { text: '₹120', correct: false },
          { text: '₹200', correct: true },
          { text: '₹1000', correct: false },
        ],
        explanation: '10x + 200 = 1200 — constant 200 is the assembly fee.',
      },
      {
        equation: '2x + 400 = 800',
        prompt: 'Ben bought 2 lamps at x rupees each. He paid ____ for delivery. Total = ₹800.',
        options: [
          { text: '₹200', correct: false },
          { text: '₹300', correct: false },
          { text: '₹400', correct: true },
          { text: '₹800', correct: false },
        ],
        explanation: '2x + 400 = 800 — constant 400 is the delivery fee.',
      },
      {
        equation: '11x + 110 = 990',
        prompt: 'Cleo bought ____ journals at x rupees each with an ₹110 membership fee. Total = ₹990.',
        options: [
          { text: '9', correct: false },
          { text: '10', correct: false },
          { text: '11', correct: true },
          { text: '99', correct: false },
        ],
        explanation: '11x + 110 = 990 — coefficient 11 means 11 journals.',
      },
      {
        equation: '7x + 140 = 700',
        prompt: 'Omar bought 7 caps at x rupees each and paid ____ in taxes. Total = ₹700.',
        options: [
          { text: '₹70', correct: false },
          { text: '₹100', correct: false },
          { text: '₹140', correct: true },
          { text: '₹700', correct: false },
        ],
        explanation: '7x + 140 = 700 — constant 140 is the tax.',
      },
      {
        equation: '3x + 180 = 450',
        prompt: 'Tara bought 3 cushions at x rupees each with an ₹180 stitching fee. Total = ____.',
        options: [
          { text: '₹270', correct: false },
          { text: '₹360', correct: false },
          { text: '₹450', correct: true },
          { text: '₹630', correct: false },
        ],
        explanation: '3x + 180 = 450 — the right-hand side 450 is the total.',
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
        equation: '2(x + 50) = 300',
        options: [
          { text: 'Two notebooks each cost x rupees and each notebook has a ₹50 cover charge. Total = ₹300.', correct: true },
          { text: 'Two notebooks cost x rupees each and ₹50 delivery was added once. Total = ₹300.', correct: false },
          { text: 'Five notebooks cost x rupees each. Total = ₹300.', correct: false },
          { text: 'Two notebooks cost ₹50 each. Total = ₹300.', correct: false },
        ],
        explanation: '2(x+50)=300: the bracket means (x+50) is per notebook — so each notebook costs x+₹50.',
      },
      {
        equation: '3(x + 40) = 330',
        options: [
          { text: '3 shirts each priced at x rupees with a ₹40 embroidery charge per shirt. Total = ₹330.', correct: true },
          { text: '3 shirts at x rupees each plus ₹40 flat shipping. Total = ₹330.', correct: false },
          { text: '4 shirts at x rupees each. Total = ₹330.', correct: false },
          { text: '3 shirts at ₹40 each. Total = ₹330.', correct: false },
        ],
        explanation: '3(x+40)=330: the +40 is per shirt, not a flat fee.',
      },
      {
        equation: '4(x + 30) = 280',
        options: [
          { text: '4 bags each at x rupees plus a ₹30 zipper upgrade per bag. Total = ₹280.', correct: true },
          { text: '4 bags at x rupees each plus ₹30 flat delivery. Total = ₹280.', correct: false },
          { text: '3 bags at x rupees each. Total = ₹280.', correct: false },
          { text: '4 bags at ₹30 each. Total = ₹280.', correct: false },
        ],
        explanation: '4(x+30)=280: the ₹30 zipper upgrade applies to each of the 4 bags.',
      },
      {
        equation: '5(x + 20) = 350',
        options: [
          { text: '5 mugs at x rupees each plus a ₹20 engraving fee per mug. Total = ₹350.', correct: true },
          { text: '5 mugs at x rupees each with ₹20 flat shipping. Total = ₹350.', correct: false },
          { text: '2 mugs at x rupees each. Total = ₹350.', correct: false },
          { text: '5 mugs at ₹20 each. Total = ₹350.', correct: false },
        ],
        explanation: '5(x+20)=350: the ₹20 engraving is per mug, totalling 5×(x+20).',
      },
      {
        equation: '6(x + 10) = 420',
        options: [
          { text: '6 pens at x rupees each with a ₹10 tip jar contribution per pen. Total = ₹420.', correct: true },
          { text: '6 pens at x rupees each with ₹10 flat packaging. Total = ₹420.', correct: false },
          { text: '1 pen at x rupees each. Total = ₹420.', correct: false },
          { text: '6 pens at ₹10 each. Total = ₹420.', correct: false },
        ],
        explanation: '6(x+10)=420: the ₹10 tip applies per pen, not as a flat fee.',
      },
      {
        equation: '2(x + 100) = 500',
        options: [
          { text: '2 tickets at x rupees each plus a ₹100 processing fee per ticket. Total = ₹500.', correct: true },
          { text: '2 tickets at x rupees each plus ₹100 flat booking fee. Total = ₹500.', correct: false },
          { text: '10 tickets at x rupees each. Total = ₹500.', correct: false },
          { text: '2 tickets at ₹100 each. Total = ₹500.', correct: false },
        ],
        explanation: '2(x+100)=500: the ₹100 processing fee is per ticket.',
      },
      {
        equation: '3(x + 70) = 360',
        options: [
          { text: '3 helmets at x rupees each with a ₹70 visor add-on per helmet. Total = ₹360.', correct: true },
          { text: '3 helmets at x rupees each plus ₹70 flat insurance. Total = ₹360.', correct: false },
          { text: '7 helmets at x rupees each. Total = ₹360.', correct: false },
          { text: '3 helmets at ₹70 each. Total = ₹360.', correct: false },
        ],
        explanation: '3(x+70)=360: ₹70 visor is per helmet, multiplied by 3.',
      },
      {
        equation: '4(x + 60) = 480',
        options: [
          { text: '4 laptops at x rupees each with a ₹60 warranty fee per laptop. Total = ₹480.', correct: true },
          { text: '4 laptops at x rupees each plus ₹60 flat delivery. Total = ₹480.', correct: false },
          { text: '6 laptops at x rupees each. Total = ₹480.', correct: false },
          { text: '4 laptops at ₹60 each. Total = ₹480.', correct: false },
        ],
        explanation: '4(x+60)=480: the ₹60 warranty is per laptop, so 4 laptops × (x+60).',
      },
      {
        equation: '5(x + 80) = 600',
        options: [
          { text: '5 caps at x rupees each with an ₹80 custom patch per cap. Total = ₹600.', correct: true },
          { text: '5 caps at x rupees each plus ₹80 flat handling. Total = ₹600.', correct: false },
          { text: '8 caps at x rupees each. Total = ₹600.', correct: false },
          { text: '5 caps at ₹80 each. Total = ₹600.', correct: false },
        ],
        explanation: '5(x+80)=600: the ₹80 custom patch applies to each of the 5 caps.',
      },
      {
        equation: '7(x + 20) = 630',
        options: [
          { text: '7 toys at x rupees each with a ₹20 gift-wrap per toy. Total = ₹630.', correct: true },
          { text: '7 toys at x rupees each plus ₹20 flat gift-wrap. Total = ₹630.', correct: false },
          { text: '2 toys at x rupees each. Total = ₹630.', correct: false },
          { text: '7 toys at ₹20 each. Total = ₹630.', correct: false },
        ],
        explanation: '7(x+20)=630: ₹20 gift-wrap is per toy, hence 7×(x+20).',
      },
      {
        equation: '3(x + 90) = 450',
        options: [
          { text: '3 plants at x rupees each with a ₹90 ceramic pot per plant. Total = ₹450.', correct: true },
          { text: '3 plants at x rupees each plus ₹90 flat delivery. Total = ₹450.', correct: false },
          { text: '9 plants at x rupees each. Total = ₹450.', correct: false },
          { text: '3 plants at ₹90 each. Total = ₹450.', correct: false },
        ],
        explanation: '3(x+90)=450: the ₹90 pot is per plant.',
      },
      {
        equation: '6(x + 50) = 600',
        options: [
          { text: '6 flowers at x rupees each with a ₹50 vase per flower. Total = ₹600.', correct: true },
          { text: '6 flowers at x rupees each plus ₹50 flat vase. Total = ₹600.', correct: false },
          { text: '5 flowers at x rupees each. Total = ₹600.', correct: false },
          { text: '6 flowers at ₹50 each. Total = ₹600.', correct: false },
        ],
        explanation: '6(x+50)=600: the ₹50 vase cost is per flower.',
      },
      {
        equation: '4(x + 100) = 800',
        options: [
          { text: '4 jerseys at x rupees each with ₹100 personalisation per jersey. Total = ₹800.', correct: true },
          { text: '4 jerseys at x rupees each plus ₹100 flat shipping. Total = ₹800.', correct: false },
          { text: '10 jerseys at x rupees each. Total = ₹800.', correct: false },
          { text: '4 jerseys at ₹100 each. Total = ₹800.', correct: false },
        ],
        explanation: '4(x+100)=800: personalisation of ₹100 applies per jersey.',
      },
      {
        equation: '2(x + 150) = 700',
        options: [
          { text: '2 watches at x rupees each with a ₹150 battery fee per watch. Total = ₹700.', correct: true },
          { text: '2 watches at x rupees each plus ₹150 flat insurance. Total = ₹700.', correct: false },
          { text: '15 watches at x rupees each. Total = ₹700.', correct: false },
          { text: '2 watches at ₹150 each. Total = ₹700.', correct: false },
        ],
        explanation: '2(x+150)=700: the ₹150 battery fee applies to each of the 2 watches.',
      },
      {
        equation: '8(x + 30) = 560',
        options: [
          { text: '8 candles at x rupees each with a ₹30 wick upgrade per candle. Total = ₹560.', correct: true },
          { text: '8 candles at x rupees each plus ₹30 flat packaging. Total = ₹560.', correct: false },
          { text: '3 candles at x rupees each. Total = ₹560.', correct: false },
          { text: '8 candles at ₹30 each. Total = ₹560.', correct: false },
        ],
        explanation: '8(x+30)=560: the ₹30 wick upgrade applies to each candle.',
      },
    ],
  },
  {
    id: 5,
    title: 'Variables on Both Sides',
    subtitle: 'Two quantities are equal — identify who is doing what.',
    color: '#f87171',
    target: 15,
    questions: [
      {
        equation: '3x + 100 = 2x + 250',
        options: [
          { text: 'Rahul buys 3 notebooks + ₹100 delivery. Aman buys 2 notebooks + ₹250 delivery. Both bills are equal.', correct: true },
          { text: 'Rahul buys 3 notebooks costing ₹100 each.', correct: false },
          { text: 'Aman buys 2 notebooks costing ₹250 each.', correct: false },
          { text: 'Rahul buys 2 notebooks + ₹100 delivery. Aman buys 3 notebooks + ₹250 delivery.', correct: false },
        ],
        explanation: '3x+100=2x+250: left side = Rahul\'s bill, right side = Aman\'s bill. Both are equal.',
      },
      {
        equation: '5x + 40 = 3x + 200',
        options: [
          { text: 'Plan A: 5 movies for x rupees each + ₹40 fee. Plan B: 3 movies for x rupees each + ₹200 fee. Both cost the same.', correct: true },
          { text: 'Plan A: 5 movies at ₹40 each. Plan B: 3 movies at ₹200 each.', correct: false },
          { text: 'Plan A: 3 movies for x rupees each + ₹40 fee. Plan B: 5 movies for x rupees each + ₹200 fee.', correct: false },
          { text: 'Plan A: 5 movies at ₹200. Plan B: 3 movies at ₹40.', correct: false },
        ],
        explanation: '5x+40=3x+200: Plan A has more movies but a smaller flat fee; both equal at the same x.',
      },
      {
        equation: '4x + 60 = x + 240',
        options: [
          { text: 'Store A: 4 pens for x rupees each + ₹60 tax. Store B: 1 pen for x rupees + ₹240 gift voucher. Both equal.', correct: true },
          { text: 'Store A: 1 pen for x rupees + ₹60. Store B: 4 pens for x rupees + ₹240.', correct: false },
          { text: 'Store A: 4 pens at ₹60 each. Store B: 1 pen at ₹240.', correct: false },
          { text: 'Store A: 4 pens at ₹240. Store B: 1 pen at ₹60.', correct: false },
        ],
        explanation: '4x+60=x+240: coefficient of x identifies how many items each party is buying.',
      },
      {
        equation: '6x + 50 = 2x + 290',
        options: [
          { text: 'Gym A charges 6x per month + ₹50 joining fee. Gym B charges 2x per month + ₹290 joining fee. Same total.', correct: true },
          { text: 'Gym A charges 2x per month + ₹50 joining fee. Gym B charges 6x per month + ₹290 joining fee.', correct: false },
          { text: 'Gym A charges ₹50 per month + 5x. Gym B charges ₹20 per month + 29x.', correct: false },
          { text: 'Gym A charges ₹290 joining. Gym B charges ₹50 joining.', correct: false },
        ],
        explanation: '6x+50=2x+290: left is Gym A (more expensive per month, cheaper joining), right is Gym B.',
      },
      {
        equation: '7x + 20 = 4x + 170',
        options: [
          { text: 'Path 1: 7 km at x rupees/km + ₹20 toll. Path 2: 4 km at x rupees/km + ₹170 toll. Same cost.', correct: true },
          { text: 'Path 1: 4 km at x rupees/km + ₹20 toll. Path 2: 7 km at x rupees/km + ₹170 toll.', correct: false },
          { text: 'Path 1: 7 km at ₹20/km. Path 2: 4 km at ₹170/km.', correct: false },
          { text: 'Path 1: 7 km at ₹170/km. Path 2: 4 km at ₹20/km.', correct: false },
        ],
        explanation: '7x+20=4x+170: Path 1 has more km but a smaller toll; Path 2 fewer km but higher toll.',
      },
      {
        equation: '2x + 300 = 5x + 60',
        options: [
          { text: 'Taxi A: 2 km at x rupees/km + ₹300 base fare. Taxi B: 5 km at x rupees/km + ₹60 base fare. Same bill.', correct: true },
          { text: 'Taxi A: 5 km at x rupees/km + ₹300 base fare. Taxi B: 2 km at x rupees/km + ₹60 base fare.', correct: false },
          { text: 'Taxi A: 2 km at ₹300/km. Taxi B: 5 km at ₹60/km.', correct: false },
          { text: 'Taxi A: 2 km at ₹60/km. Taxi B: 5 km at ₹300/km.', correct: false },
        ],
        explanation: '2x+300=5x+60: Taxi A fewer km but higher base; Taxi B more km but lower base. Equal at some x.',
      },
      {
        equation: '8x + 10 = 3x + 260',
        options: [
          { text: 'Worker A earns 8x per hour + ₹10 bonus. Worker B earns 3x per hour + ₹260 bonus. Same total.', correct: true },
          { text: 'Worker A earns 3x per hour + ₹10 bonus. Worker B earns 8x per hour + ₹260 bonus.', correct: false },
          { text: 'Worker A earns ₹80/hr + 1x. Worker B earns ₹30/hr + 26x.', correct: false },
          { text: 'Worker A earns ₹80 per hour. Worker B earns ₹30 per hour.', correct: false },
        ],
        explanation: '8x+10=3x+260: Worker A higher hourly rate, smaller bonus; Worker B lower rate, bigger bonus.',
      },
      {
        equation: '9x + 0 = 4x + 350',
        options: [
          { text: 'Deal A: 9 items at x rupees each, no surcharge. Deal B: 4 items at x rupees each + ₹350 voucher bonus. Same total.', correct: true },
          { text: 'Deal A: 4 items at x rupees each. Deal B: 9 items at x rupees each + ₹350.', correct: false },
          { text: 'Deal A: 9 items at ₹350 each. Deal B: 4 items at ₹0 each.', correct: false },
          { text: 'Deal A: 9 items at ₹0. Deal B: 4 items at ₹350.', correct: false },
        ],
        explanation: '9x=4x+350: Deal A just 9x; Deal B 4x plus a ₹350 credit. Equal at x=70.',
      },
      {
        equation: '3x + 150 = 6x + 30',
        options: [
          { text: 'Subscription A: 3 months at x rupees/mo + ₹150 setup. Subscription B: 6 months at x rupees/mo + ₹30 setup. Same total.', correct: true },
          { text: 'Subscription A: 6 months at x rupees/mo + ₹150 setup. Subscription B: 3 months at x rupees/mo + ₹30 setup.', correct: false },
          { text: 'Subscription A: 3 months at ₹150/mo. Subscription B: 6 months at ₹30/mo.', correct: false },
          { text: 'Subscription A: 3 months at ₹30/mo. Subscription B: 6 months at ₹150/mo.', correct: false },
        ],
        explanation: '3x+150=6x+30: A shorter with larger setup; B longer with smaller setup.',
      },
      {
        equation: '10x + 50 = 7x + 200',
        options: [
          { text: 'Route A: 10 km at x rupees/km + ₹50 parking. Route B: 7 km at x rupees/km + ₹200 parking. Same cost.', correct: true },
          { text: 'Route A: 7 km at x rupees/km + ₹50 parking. Route B: 10 km at x rupees/km + ₹200 parking.', correct: false },
          { text: 'Route A: 10 km at ₹200/km. Route B: 7 km at ₹50/km.', correct: false },
          { text: 'Route A: 10 km at ₹50/km. Route B: 7 km at ₹200/km.', correct: false },
        ],
        explanation: '10x+50=7x+200: Route A is longer but cheaper parking; Route B shorter but more expensive parking.',
      },
      {
        equation: '4x + 180 = x + 300',
        options: [
          { text: 'Club A: 4 sessions at x rupees each + ₹180 registration. Club B: 1 session at x rupees + ₹300 registration. Same cost.', correct: true },
          { text: 'Club A: 1 session at x rupees + ₹180 registration. Club B: 4 sessions at x rupees + ₹300 registration.', correct: false },
          { text: 'Club A: 4 sessions at ₹180 each. Club B: 1 session at ₹300.', correct: false },
          { text: 'Club A: 4 sessions at ₹300 each. Club B: 1 session at ₹180.', correct: false },
        ],
        explanation: '4x+180=x+300: Club A more sessions + smaller registration; Club B 1 session + bigger registration.',
      },
      {
        equation: '5x + 70 = 2x + 220',
        options: [
          { text: 'Team A rents 5 bikes at x rupees each + ₹70 helmet fee. Team B rents 2 bikes at x rupees each + ₹220 helmet fee. Equal.', correct: true },
          { text: 'Team A rents 2 bikes at x rupees each + ₹70 helmet fee. Team B rents 5 bikes at x rupees each + ₹220 helmet fee.', correct: false },
          { text: 'Team A pays ₹50 per bike. Team B pays ₹20 per bike.', correct: false },
          { text: 'Team A rents 5 bikes at ₹220/bike. Team B rents 2 bikes at ₹70/bike.', correct: false },
        ],
        explanation: '5x+70=2x+220: Team A more bikes + smaller fee; Team B fewer bikes + larger fee.',
      },
      {
        equation: '6x + 40 = 3x + 190',
        options: [
          { text: 'Shop A: 6 items at x rupees each + ₹40 bag fee. Shop B: 3 items at x rupees each + ₹190 bag fee. Both cost the same.', correct: true },
          { text: 'Shop A: 3 items at x rupees each + ₹40 bag fee. Shop B: 6 items at x rupees each + ₹190 bag fee.', correct: false },
          { text: 'Shop A: 6 items at ₹40 each. Shop B: 3 items at ₹190 each.', correct: false },
          { text: 'Shop A: 6 items at ₹190 each. Shop B: 3 items at ₹40 each.', correct: false },
        ],
        explanation: '6x+40=3x+190: Shop A sells more items with a smaller flat fee.',
      },
      {
        equation: '8x + 100 = 4x + 300',
        options: [
          { text: 'Trainer A: 8 classes at x rupees each + ₹100 entry. Trainer B: 4 classes at x rupees each + ₹300 entry. Same total.', correct: true },
          { text: 'Trainer A: 4 classes at x rupees each + ₹100 entry. Trainer B: 8 classes at x rupees each + ₹300 entry.', correct: false },
          { text: 'Trainer A: 8 classes at ₹100 each. Trainer B: 4 classes at ₹300 each.', correct: false },
          { text: 'Trainer A: 8 classes at ₹300 each. Trainer B: 4 classes at ₹100 each.', correct: false },
        ],
        explanation: '8x+100=4x+300: Trainer A has more classes but lower entry fee.',
      },
      {
        equation: '7x + 50 = 2x + 400',
        options: [
          { text: 'Vendor A: 7 products at x rupees each + ₹50 tax. Vendor B: 2 products at x rupees each + ₹400 tax. Same cost.', correct: true },
          { text: 'Vendor A: 2 products at x rupees each + ₹50 tax. Vendor B: 7 products at x rupees each + ₹400 tax.', correct: false },
          { text: 'Vendor A: 7 products at ₹50 each. Vendor B: 2 products at ₹400 each.', correct: false },
          { text: 'Vendor A: 7 products at ₹400 each. Vendor B: 2 products at ₹50 each.', correct: false },
        ],
        explanation: '7x+50=2x+400: Vendor A sells 7 products, Vendor B sells 2 products.',
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
        equation: '5(x - 20) = 400',
        options: [
          { text: 'Five T-shirts each cost x rupees and each gets a ₹20 discount. Total = ₹400.', correct: true },
          { text: 'Five T-shirts cost x rupees each and a ₹20 discount was applied once. Total = ₹400.', correct: false },
          { text: 'Two T-shirts cost x rupees each. Total = ₹400.', correct: false },
          { text: 'Five T-shirts cost ₹20 each. Total = ₹400.', correct: false },
        ],
        explanation: '5(x-20)=400: the ₹20 discount is per T-shirt (inside the bracket), not a flat once-off.',
      },
      {
        equation: '2x + 3x = 500',
        options: [
          { text: 'Priya earns 2x rupees from morning shifts and 3x rupees from evening shifts. Total = ₹500.', correct: true },
          { text: 'Priya earns ₹20 in the morning and ₹30 in the evening. Total = ₹500.', correct: false },
          { text: 'Priya earns 50 rupees on x different days. Total = ₹500.', correct: false },
          { text: 'Priya earns 20 rupees per hour for 3x hours. Total = ₹500.', correct: false },
        ],
        explanation: '2x+3x=500: two variable income sources combine to ₹500. Like terms add to 5x=500.',
      },
      {
        equation: 'x/2 + 50 = 150',
        options: [
          { text: 'Half of a jar of coins plus ₹50 from Mia equals ₹150 total.', correct: true },
          { text: '2 jars of coins plus ₹50 equals ₹150.', correct: false },
          { text: 'A jar of coins divided by 50 equals ₹150.', correct: false },
          { text: '50 jars of coins plus ₹20 equals ₹150.', correct: false },
        ],
        explanation: 'x/2+50=150: x is the jar total; half of it plus ₹50 = ₹150.',
      },
      {
        equation: '2(3x + 10) = 200',
        options: [
          { text: '2 boxes each contain 3 items at x rupees each plus a ₹10 packing. Total = ₹200.', correct: true },
          { text: '2 boxes at 3x rupees each plus ₹10 flat. Total = ₹200.', correct: false },
          { text: '3 boxes with x items each plus ₹20. Total = ₹200.', correct: false },
          { text: '6 items at x rupees each minus ₹10. Total = ₹200.', correct: false },
        ],
        explanation: '2(3x+10)=200: each box has (3x+10) value; two boxes give 2(3x+10)=200.',
      },
      {
        equation: '6x - 2x = 320',
        options: [
          { text: 'A factory makes 6x units but 2x are defective. Good units sold = 320.', correct: true },
          { text: 'A factory makes 6 units and loses 2x. Total sold = 320.', correct: false },
          { text: 'A factory makes 6x units costing ₹20 each. Total = ₹320.', correct: false },
          { text: 'A factory makes 8x units and sells 320.', correct: false },
        ],
        explanation: '6x-2x=4x=320: 6x made, 2x defective, leaving 4x=320 good units.',
      },
      {
        equation: '5x + 30 = 3x + 130',
        options: [
          { text: 'Shop A: 5 kg of rice at x rupees/kg + ₹30 bag. Shop B: 3 kg of rice at x rupees/kg + ₹130 bag. Same bill.', correct: true },
          { text: 'Shop A: 3 kg at x rupees/kg + ₹30. Shop B: 5 kg at x rupees/kg + ₹130.', correct: false },
          { text: 'Shop A: 5 kg at ₹130/kg. Shop B: 3 kg at ₹30/kg.', correct: false },
          { text: 'Shop A: 5 kg at ₹30/kg. Shop B: 3 kg at ₹130/kg.', correct: false },
        ],
        explanation: '5x+30=3x+130: Shop A more kg + cheaper bag, Shop B fewer kg + pricier bag.',
      },
      {
        equation: '4(x + 70) = 600',
        options: [
          { text: '4 candles at x rupees each with a ₹70 holder per candle. Total = ₹600.', correct: true },
          { text: '4 candles at x rupees each with ₹70 flat delivery. Total = ₹600.', correct: false },
          { text: '7 candles at x rupees each. Total = ₹600.', correct: false },
          { text: '4 candles at ₹70 each. Total = ₹600.', correct: false },
        ],
        explanation: '4(x+70)=600: the ₹70 holder is per candle (inside bracket × 4).',
      },
      {
        equation: '3x - 2x + 100 = 250',
        options: [
          { text: 'Sam earned 3x rupees and spent 2x rupees, keeping a net of x. He added ₹100 savings. Total = ₹250.', correct: true },
          { text: 'Sam earned 3x rupees and ₹100. He spent 2x and has ₹250 left.', correct: false },
          { text: 'Sam has 3 bags of x rupees and 2 extra bags. He adds ₹100. Total = ₹250.', correct: false },
          { text: 'Sam earned 3x and paid 2x tax. Net + ₹100 = ₹250.', correct: false },
        ],
        explanation: '3x-2x+100=x+100=250: net income x plus ₹100 savings equals ₹250.',
      },
      {
        equation: 'x/3 + 80 = 200',
        options: [
          { text: 'One-third of the prize money plus ₹80 donation equals ₹200.', correct: true },
          { text: 'Three times the prize money plus ₹80 equals ₹200.', correct: false },
          { text: 'One-third of ₹80 plus x equals ₹200.', correct: false },
          { text: 'Prize divided by 80 plus 3 equals ₹200.', correct: false },
        ],
        explanation: 'x/3+80=200: a third of x plus ₹80 = ₹200.',
      },
      {
        equation: '2(x + 30) + 40 = 200',
        options: [
          { text: '2 boxes each with x items at ₹1 each + ₹30 label per box, plus ₹40 flat shipping. Total = ₹200.', correct: true },
          { text: '2 boxes at x rupees each with ₹30 and ₹40 added as flat fees. Total = ₹200.', correct: false },
          { text: '3 boxes with x items each plus ₹40. Total = ₹200.', correct: false },
          { text: '2 boxes at ₹30 each plus 4x. Total = ₹200.', correct: false },
        ],
        explanation: '2(x+30)+40=200: bracket handles per-box cost; the +40 is an extra flat shipping fee.',
      },
      {
        equation: '9x + 50 = 4x + 300',
        options: [
          { text: 'Plumber A: 9 hours at x rupees/hr + ₹50 trip fee. Plumber B: 4 hours at x rupees/hr + ₹300 trip fee. Same total.', correct: true },
          { text: 'Plumber A: 4 hours at x rupees/hr + ₹50 trip fee. Plumber B: 9 hours at x rupees/hr + ₹300 trip fee.', correct: false },
          { text: 'Plumber A: 9 hours at ₹300/hr. Plumber B: 4 hours at ₹50/hr.', correct: false },
          { text: 'Plumber A: 9 hours at ₹50/hr. Plumber B: 4 hours at ₹300/hr.', correct: false },
        ],
        explanation: '9x+50=4x+300: more hours vs higher trip fee — they balance out at some x.',
      },
      {
        equation: '6(x + 40) - 60 = 420',
        options: [
          { text: '6 boxes each costing x+40 rupees, then a ₹60 coupon deducted. Total = ₹420.', correct: true },
          { text: '6 boxes at x rupees each, plus ₹40 and minus ₹60. Total = ₹420.', correct: false },
          { text: '6 boxes at ₹40 each plus ₹420.', correct: false },
          { text: '6 boxes at ₹60 each plus 4x. Total = ₹420.', correct: false },
        ],
        explanation: '6(x+40)-60=420: bracket gives per-box cost, then one ₹60 coupon is removed at the end.',
      },
      {
        equation: '3x + 40 = 2(x + 50)',
        options: [
          { text: 'Plan A: 3 months at x rupees/mo + ₹40 setup. Plan B: 2 payments of (x+50) rupees each. Same total.', correct: true },
          { text: 'Plan A: 2 months at x rupees/mo + ₹40. Plan B: 3 payments of (x+50) each.', correct: false },
          { text: 'Plan A: 3 months at ₹40/mo. Plan B: 2 payments at ₹50 each.', correct: false },
          { text: 'Plan A: 3x + 40 rupees total. Plan B: 2x rupees + 50.', correct: false },
        ],
        explanation: '3x+40=2(x+50)=2x+100: two different payment structures that turn out equal.',
      },
      {
        equation: '3(x + 20) = 2(x + 60)',
        options: [
          { text: '3 bags each at (x+20) rupees. 2 larger bags each at (x+60) rupees. Same total cost.', correct: true },
          { text: '3 bags at x rupees each plus ₹20 tax. 2 bags at ₹60 each.', correct: false },
          { text: '3 bags at ₹20 each equal 2 bags at ₹60 each.', correct: false },
          { text: '2 bags each at (x+20) rupees. 3 bags each at (x+60) rupees.', correct: false },
        ],
        explanation: '3(x+20)=2(x+60): two bundle deals with different quantities and per-item extras that cost the same.',
      },
      {
        equation: '5x + 2(x + 40) = 500',
        options: [
          { text: 'Ali buys 5 items at x rupees each and 2 items at (x+40) rupees each. Total = ₹500.', correct: true },
          { text: 'Ali buys 5 items at x rupees each plus 2 flat fees of ₹40. Total = ₹500.', correct: false },
          { text: 'Ali buys 7 items at x rupees each plus ₹40. Total = ₹500.', correct: false },
          { text: 'Ali buys 5 items at ₹40 each plus 2x. Total = ₹500.', correct: false },
        ],
        explanation: '5x+2(x+40)=5x+2x+80=7x+80=500: 5 standard items + 2 premium items at (x+40) each.',
      },
    ],
  },
];

const QUESTION_HINTS = {
  '2x + 100 = 500': 'Tip: the number in front of x = quantity of items. The stand-alone number = flat fee.',
  '3x + 50 = 200': 'Tip: 3x means 3 things at x rupees each. The +50 is a flat add-on, not per item.',
  '4x + 80 = 400': 'Tip: coefficient of x = quantity; the constant = extra one-time charge.',
  '5x + 150 = 650': 'Tip: 5x means 5 items. The 150 is a one-time deposit, not per item.',
  '6x + 120 = 600': 'Tip: 6x means 6 identical things. The +120 is a service charge paid once.',
  'x + 250 = 1000': 'Tip: just one unknown amount x. The 250 is already there; together they reach 1000.',
  '7x + 30 = 380': 'Tip: 7 items at x rupees each, plus ₹30 one-off tax = ₹380 total.',
  '2x + 200 = 800': 'Tip: 2 items at x each, plus a flat ₹200 fee (not per item).',
  '9x + 10 = 280': 'Tip: nine items at x each. The ₹10 is a single packing charge.',
  '3x + 90 = 300': 'Tip: coefficient 3 = quantity. Constant 90 = flat delivery.',
  '4x + 40 = 200': 'Tip: 4 items at x each. The separate +40 is a one-time tax.',
  '10x + 50 = 550': 'Tip: 10 items at x each; ₹50 fee added once at checkout.',
  '5x - 100 = 400': 'Tip: subtraction = something was taken OFF (discount/coupon), not added on.',
  '4x - 80 = 240': 'Tip: the minus sign means money is removed. Think coupon or rebate, not shipping.',
  '6x - 60 = 300': 'Tip: -60 reduces the final bill. A delivery fee would be +60, not -60.',
  '3x - 120 = 150': 'Tip: subtract means a discount was applied AFTER buying 3 items.',
  '7x - 140 = 560': 'Tip: the -140 is a saving (discount card), not an extra cost.',
  '2x - 40 = 100': 'Tip: minus means money off. A discount fits; a tip adds money.',
  '8x - 160 = 480': 'Tip: -160 is a rebate. Delivery would add, not subtract.',
  '5x - 200 = 300': 'Tip: promotional discount = subtraction. DLC fee = addition. Which is this?',
  '9x - 90 = 630': 'Tip: -90 reduces the cost. A store credit does that; a gift-wrap fee would add.',
  '10x - 300 = 700': 'Tip: bulk discount reduces total cost, which maps to subtraction.',
  '4x - 200 = 400': 'Tip: sale discount subtracts from price, not adds like an assembly fee.',
  '6x - 300 = 120': 'Tip: -300 removes money. A group discount fits; a deposit would be added.',
  '3x - 60 = 180': 'Tip: clearance discount takes money off. Packaging fee adds money.',
  '11x - 110 = 770': 'Tip: -110 is money removed (rebate). Shipping would appear as +110.',
  '2x - 140 = 200': 'Tip: seasonal discount subtracts. Installation charge would add.',
  '6x + 120 = 480': 'Tip: the number multiplying x tells you how many were ordered.',
  '2x + 160 = 500': 'Tip: the constant not attached to x is the extra fee.',
  'x + 300 = 750': 'Tip: when no coefficient, x is just x. The constant is what was added.',
  '7x + 70 = 560': 'Tip: the lone constant is the gift-wrap fee, separate from the item price.',
  '9x + 180 = 900': 'Tip: the total is always on the right of the equals sign.',
  '3x + 210 = 510': 'Tip: how many times does x appear? That coefficient is the quantity.',
  '8x + 40 = 680': 'Tip: the +40 is the bag cost, a constant not multiplied by x.',
  '5x + 250 = 1000': 'Tip: the constant in the equation matches the customisation charge.',
  '4x + 120 = 360': 'Tip: the delivery charge is the constant; the quantity is the coefficient.',
  '6x + 60 = 420': 'Tip: coefficient of x = number of packs. +60 = recycling fee.',
  '10x + 200 = 1200': 'Tip: the total is on the right; the constant is the assembly fee.',
  '2x + 400 = 800': 'Tip: the constant 400 is the delivery fee, not multiplied by x.',
  '11x + 110 = 990': 'Tip: coefficient 11 = how many journals. Constant 110 = the fee.',
  '7x + 140 = 700': 'Tip: the tax is the constant (140), not the price per item.',
  '3x + 180 = 450': 'Tip: the total is the number on the right of the equals sign.',
  '2(x + 50) = 300': 'Tip: brackets mean the extra charge is PER ITEM, not a flat one-time fee.',
  '3(x + 40) = 330': 'Tip: the +40 is inside the bracket, so it applies to each of the 3 shirts.',
  '4(x + 30) = 280': 'Tip: bracket = cost of one item = (x + extra). Then multiply by quantity.',
  '5(x + 20) = 350': 'Tip: 5 x (x + 20) means five items, each costing x plus ₹20 extra.',
  '6(x + 10) = 420': 'Tip: the ₹10 inside the bracket is added to each item, not charged once.',
  '2(x + 100) = 500': 'Tip: ₹100 processing is per ticket (inside bracket), not a flat booking fee.',
  '3(x + 70) = 360': 'Tip: the ₹70 visor is part of each helmet price; it multiplies with 3.',
  '4(x + 60) = 480': 'Tip: warranty is per laptop, inside bracket. Flat delivery would be outside.',
  '5(x + 80) = 600': 'Tip: the patch cost is inside the bracket, applied to each cap.',
  '7(x + 20) = 630': 'Tip: per-item gift-wrap is inside bracket. Flat gift-wrap would be outside.',
  '3(x + 90) = 450': 'Tip: the ₹90 pot is included in each plant price, that is why it is inside.',
  '6(x + 50) = 600': 'Tip: vase is per-flower, multiply with 6 inside the bracket.',
  '4(x + 100) = 800': 'Tip: personalisation per jersey is inside the bracket, multiplied by 4.',
  '2(x + 150) = 700': 'Tip: the ₹150 fee is per watch, it lives inside the bracket.',
  '8(x + 30) = 560': 'Tip: wick upgrade is per candle. Packaging once would be outside.',
  '3x + 100 = 2x + 250': 'Tip: left side = one person total; right side = another. Match coefficients to quantities.',
  '5x + 40 = 3x + 200': 'Tip: the coefficient of x on each side tells you how many each plan includes.',
  '4x + 60 = x + 240': 'Tip: left side has 4 items; right side has 1 item. Match the larger coefficient.',
  '6x + 50 = 2x + 290': 'Tip: which side has more monthly charges vs a higher joining fee?',
  '7x + 20 = 4x + 170': 'Tip: more km but small toll OR fewer km but big toll, both cost the same.',
  '2x + 300 = 5x + 60': 'Tip: fewer km with high base fare equals more km with low base fare.',
  '8x + 10 = 3x + 260': 'Tip: left = high hourly rate + tiny bonus. Right = low hourly rate + big bonus.',
  '9x + 0 = 4x + 350': 'Tip: left side has no flat fee (0). Right side has a ₹350 bonus added.',
  '3x + 150 = 6x + 30': 'Tip: shorter subscription + large setup equals longer subscription + small setup.',
  '10x + 50 = 7x + 200': 'Tip: more km + cheap parking = fewer km + expensive parking.',
  '4x + 180 = x + 300': 'Tip: left is 4 sessions + small fee. Right is 1 session + big fee.',
  '5x + 70 = 2x + 220': 'Tip: more bikes + small helmet fee = fewer bikes + large helmet fee.',
  '5(x - 20) = 400': 'Tip: the minus inside the bracket means EACH item gets the discount, not just once.',
  '2x + 3x = 500': 'Tip: two separate terms with x represent two different income sources.',
  'x/2 + 50 = 150': 'Tip: x/2 means HALF of x. Which story has only half?',
  '2(3x + 10) = 200': 'Tip: think of (3x+10) as what is inside one box, then multiplied by 2 boxes.',
  '6x - 2x = 320': 'Tip: subtract to find what remains, like made minus defective.',
  '5x + 30 = 3x + 130': 'Tip: left = one shop total; right = another. Match coefficients to quantities.',
  '4(x + 70) = 600': 'Tip: the ₹70 holder is per candle (inside bracket), not a flat delivery fee.',
  '3x - 2x + 100 = 250': 'Tip: 3x earned minus 2x spent = x net. Then add ₹100 savings.',
  'x/3 + 80 = 200': 'Tip: x/3 means one-third of x. Which story divides x by 3?',
  '2(x + 30) + 40 = 200': 'Tip: the (x+30) bracket is per-box cost. The +40 after is a separate flat fee.',
  '9x + 50 = 4x + 300': 'Tip: left = one contractor (more hours, cheaper materials). Right = the other.',
  '6(x + 40) - 60 = 420': 'Tip: bracket is per-box cost; the -60 after the bracket is one coupon at checkout.',
  '3x + 40 = 2(x + 50)': 'Tip: left = plan A (linear). Right = plan B (bracket). Both total the same.',
  '3(x + 20) = 2(x + 60)': 'Tip: both sides have brackets. Match each bracket to the per-item cost of each bundle.',
  '5x + 2(x + 40) = 500': 'Tip: 5x = 5 standard items. 2(x+40) = 2 premium items, each at (x+40).',
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

// Build a fresh shuffled copy of a module's questions on every play/re-entry.
function buildShuffled(moduleIdx) {
  const questions = MODULES[moduleIdx].questions;
  return shuffle(questions).map(q => ({
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
  const a = ri(2, 9), x = ri(10, 50), b = ri(2, 20) * 10;
  const c = a * x + b;
  const nm = gp(GN), it = gp(GI), fe = gp(GF);
  return {
    equation: `${a}x + ${b} = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x rupees each and paid a ₹${b} ${fe}. Total = ₹${c}.`, correct: true },
      { text: `${nm} bought ${b} ${it} at x rupees each. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at ₹${b} each. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${c} ${it} at x rupees each. Total = ₹${b}.`, correct: false },
    ]),
    explanation: `${a}x + ${b} = ${c}: ${a} ${it} at x each (${a}x), plus ₹${b} flat ${fe} = ₹${c} total.`,
  };
}

// Template 2: ax - b = c  (discount)
function gen2() {
  const a = ri(2, 9), x = ri(15, 60), b = ri(2, 15) * 10;
  const c = a * x - b;
  if (c <= 0) return gen2();
  const nm = gp(GN), it = gp(GI), di = gp(GD), fe = gp(GF);
  return {
    equation: `${a}x - ${b} = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x rupees each and received a ₹${b} ${di}. Final total = ₹${c}.`, correct: true },
      { text: `${nm} bought ${a} ${it} at x rupees each and paid a ₹${b} ${fe}. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at x rupees each with a ₹${b} ${di} per item. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${b} ${it} at x rupees each and received a ₹${a * 10} ${di}. Total = ₹${c}.`, correct: false },
    ]),
    explanation: `${a}x − ${b} = ${c}: the −${b} is a ${di} (subtraction = money off, not added on).`,
  };
}

// Template 3: a(x + b) = c  (per-item extra in bracket)
function gen3() {
  const a = ri(2, 7), b = ri(2, 15) * 10, x = ri(10, 50);
  const c = a * (x + b);
  const nm = gp(GN), it = gp(GI), ex = gp(GX), fe = gp(GF);
  return {
    equation: `${a}(x + ${b}) = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x rupees each with a ₹${b} ${ex}. Total = ₹${c}.`, correct: true },
      { text: `${nm} bought ${a} ${it} at x rupees each with a flat ₹${b} ${fe}. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${b} ${it} at x rupees each. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at ₹${b} each. Total = ₹${c}.`, correct: false },
    ]),
    explanation: `${a}(x+${b})=${c}: the ₹${b} ${ex} is inside the bracket — it applies per item, multiplied by ${a}.`,
  };
}

// Template 4: a(x - b) = c  (per-item discount in bracket)
function gen4() {
  const a = ri(2, 7), b = ri(2, 10) * 10, x = ri(Math.floor(b / 10) + 3, 30) * 10;
  const c = a * (x - b);
  if (c <= 0) return gen4();
  const nm = gp(GN), it = gp(GI), di = gp(GD), fe = gp(GF);
  return {
    equation: `${a}(x - ${b}) = ${c}`,
    options: shuffle([
      { text: `${nm} bought ${a} ${it} at x rupees each with a ₹${b} ${di} per item. Total = ₹${c}.`, correct: true },
      { text: `${nm} bought ${a} ${it} at x rupees each with a flat ₹${b} ${di}. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${b} ${it} at x rupees each. Total = ₹${c}.`, correct: false },
      { text: `${nm} bought ${a} ${it} at ₹${b} each. Total = ₹${c}.`, correct: false },
    ]),
    explanation: `${a}(x−${b})=${c}: the ₹${b} ${di} is inside the bracket, applied per item (×${a}), not just once.`,
  };
}

// Template 5: ax + b = cx + d  (variables on both sides)
function gen5() {
  const a = ri(4, 10), c = ri(1, a - 2), x = ri(10, 50), d = ri(5, 50) * 10;
  const b = c * x + d - a * x;
  if (b <= 0) return gen5();
  let n1 = gp(GN), n2 = gp(GN);
  while (n2 === n1) n2 = gp(GN);
  const it = gp(GI), f1 = gp(GF), f2 = gp(GF);
  return {
    equation: `${a}x + ${b} = ${c}x + ${d}`,
    options: shuffle([
      { text: `${n1} buys ${a} ${it} at x rupees each + ₹${b} ${f1}. ${n2} buys ${c} ${it} at x rupees each + ₹${d} ${f2}. Both bills are equal.`, correct: true },
      { text: `${n1} buys ${c} ${it} at x rupees each + ₹${b} ${f1}. ${n2} buys ${a} ${it} at x rupees each + ₹${d} ${f2}. Both bills are equal.`, correct: false },
      { text: `${n1} buys ${a} ${it} at ₹${b} each. ${n2} buys ${c} ${it} at ₹${d} each.`, correct: false },
      { text: `${n1} buys ${a} ${it} at x rupees each + ₹${d} ${f1}. ${n2} buys ${c} ${it} at x rupees each + ₹${b} ${f2}. Both bills are equal.`, correct: false },
    ]),
    explanation: `${a}x+${b}=${c}x+${d}: left = ${n1}'s bill (${a} items + ₹${b}); right = ${n2}'s bill (${c} items + ₹${d}). Equal at x=${x}.`,
  };
}

// Template 6: x/a + b = c  (division)
function gen6() {
  const a = gp([2, 3, 4, 5]);
  const b = ri(2, 25) * 10;
  const xOverA = ri(3, 18) * 10;
  const c = xOverA + b;
  const nm = gp(GN);
  const fw = { 2: 'Half', 3: 'One-third', 4: 'One-quarter', 5: 'One-fifth' };
  const ft = { 2: 'half', 3: 'one-third', 4: 'one-quarter', 5: 'one-fifth' };
  return {
    equation: `x/${a} + ${b} = ${c}`,
    options: shuffle([
      { text: `${fw[a]} of ${nm}'s savings plus ₹${b} pocket money equals ₹${c}.`, correct: true },
      { text: `${a} times ${nm}'s savings plus ₹${b} equals ₹${c}.`, correct: false },
      { text: `${nm}'s savings divided by ${b} plus ${a} equals ₹${c}.`, correct: false },
      { text: `${fw[a]} of ₹${c} minus ₹${b} equals ${nm}'s savings.`, correct: false },
    ]),
    explanation: `x/${a}+${b}=${c}: x/${a} is ${ft[a]} of x. Add ₹${b} to get ₹${c} total.`,
  };
}

// Template 7: ax + bx = c  (like terms / two income sources)
function gen7() {
  const a = ri(3, 8), b = ri(1, a - 1), x = ri(10, 50);
  const c = (a + b) * x;
  const nm = gp(GN);
  const s1 = gp(['tutoring', 'freelancing', 'morning shifts', 'a side gig']);
  const s2 = gp(['evening shifts', 'part-time work', 'a weekend gig', 'consulting']);
  return {
    equation: `${a}x + ${b}x = ${c}`,
    options: shuffle([
      { text: `${nm} earns ${a}x rupees from ${s1} and ${b}x rupees from ${s2}. Total income = ₹${c}.`, correct: true },
      { text: `${nm} earns ₹${a * 10} per hour for x hours and spends ${b}x rupees. Net = ₹${c}.`, correct: false },
      { text: `${nm} earns ${a + b} rupees on x different days. Total = ₹${c}.`, correct: false },
      { text: `${nm} earns ${a}x from ${s1} and gives ${b}x away. Amount kept = ₹${c}.`, correct: false },
    ]),
    explanation: `${a}x + ${b}x = ${a + b}x = ${c}: two income streams in terms of x combine to give ₹${c}.`,
  };
}

const TEMPLATES = [gen1, gen1, gen1, gen2, gen2, gen3, gen4, gen5, gen5, gen6, gen7];

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
  if (moduleIdx === 'custom') return 90;
  if (typeof moduleIdx === 'number' && moduleIdx >= 3) return 90; // Harder questions (Levels 4-6 & Custom): 90s
  return 60; // Easier questions (Levels 1-3): 60s
};
const TIMER_MAX = 60;

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
    parts: [{ t: '2x', c: 0 }, { t: '+', s: 1 }, { t: '100', c: 1 }, { t: '=', s: 1 }, { t: '500', c: 2 }],
    story: [
      { txt: 'Kavya bought' }, { need: '2x', fill: '2 sketchbooks costing x rupees each' }, { txt: 'then she paid' },
      { need: '100', fill: '₹100 express delivery' }, { txt: 'and in total' }, { need: '500', fill: '₹500 total bill' }
    ],
    chips: [
      { v: '100', e: '🚚', t: '₹100 express delivery' }, { v: '500', e: '🧾', t: '₹500 total bill' },
      { v: 'x', e: '✏️', t: '5 free pencils' }, { v: '2x', e: '🎨', t: '2 sketchbooks costing x rupees each' }
    ],
    q: 'What is the price of ONE sketchbook (x)?',
    opts: ['₹100', '₹200', '₹250', '₹300'],
    ans: 1,
    why: '2 sketchbooks = ₹400 (₹200 each), plus ₹100 delivery = ₹500. So x = ₹200 ✅'
  },
  {
    parts: [{ t: '3x', c: 0 }, { t: '+', s: 1 }, { t: '50', c: 1 }, { t: '=', s: 1 }, { t: '200', c: 2 }],
    story: [
      { txt: 'Zane collected' }, { need: '3x', fill: '3 prize boxes with x tickets each' }, { txt: 'and added' },
      { need: '50', fill: '50 bonus tickets' }, { txt: 'making' }, { need: '200', fill: '200 tickets in all' }
    ],
    chips: [
      { v: '200', e: '🏆', t: '200 tickets in all' }, { v: '3x', e: '🎟️', t: '3 prize boxes with x tickets each' },
      { v: 'x', e: '👾', t: '1 arcade pass' }, { v: '50', e: '✨', t: '50 bonus tickets' }
    ],
    q: 'How many tickets are in ONE prize box (x)?',
    opts: ['30', '50', '60', '150'],
    ans: 1,
    why: '3 boxes = 150 tickets (50 each), plus 50 = 200 tickets. So x = 50 ✅'
  },
  {
    parts: [{ t: '4x', c: 0 }, { t: '−', s: 1 }, { t: '20', c: 1 }, { t: '=', s: 1 }, { t: '140', c: 2 }],
    story: [
      { txt: 'Tariq harvested' }, { need: '4x', fill: '4 baskets with x peaches each' }, { txt: 'he lost' },
      { need: '20', fill: '20 peaches on the path' }, { txt: 'and was left with' }, { need: '140', fill: '140 peaches left' }
    ],
    chips: [
      { v: '4x', e: '🍑', t: '4 baskets with x peaches each' }, { v: '140', e: '🧺', t: '140 peaches left' },
      { v: 'x', e: '🐝', t: '3 honeybees' }, { v: '20', e: '❌', t: '20 peaches on the path' }
    ],
    q: 'How many peaches were in ONE basket (x)?',
    opts: ['30', '40', '50', '70'],
    ans: 1,
    why: '4 baskets = 160 peaches (40 each), lose 20 = 140 peaches. So x = 40 ✅'
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

function getInteractiveQuestion(rawQ, qIdx = 0) {
  if (!rawQ) return HTML_LEVELS[0];
  if (rawQ.parts && rawQ.story && rawQ.chips) return rawQ;

  const name = UNIQUE_NAMES[qIdx % UNIQUE_NAMES.length];
  const theme = THEMES[qIdx % THEMES.length];

  const eq = rawQ.equation || '2x + 100 = 500';
  const cleanEq = eq.replace('?', 'x').trim();

  const stdMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)$/i);
  const multMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*=\s*(\d+)$/i);
  const bracketMatch = cleanEq.match(/^(\d+)\((x|y|a|n)\s*([+\-−])\s*(\d+)\)\s*=\s*(\d+)$/i);
  const bothSidesMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)\s*=\s*(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)$/i);
  const combineMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d*x|\d*y|\d*a|\d*n)\s*=\s*(\d+)$/i);
  const fracMatch = cleanEq.match(/^([a-z])\/(\d+)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)$/i);
  const bracketCoeffMatch = cleanEq.match(/^(\d+)\((\d+[a-z])\s*([+\-−])\s*(\d+)\)\s*=\s*(\d+)$/i);
  const tripleTermMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)$/i);
  const bracketPlusFlatMatch = cleanEq.match(/^(\d+)\((x|y|a|n)\s*([+\-−])\s*(\d+)\)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)$/i);
  const linearEqualsBracketMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)\((x|y|a|n)\s*([+\-−])\s*(\d+)\)$/i);
  const doubleBracketMatch = cleanEq.match(/^(\d+)\((x|y|a|n)\s*([+\-−])\s*(\d+)\)\s*=\s*(\d+)\((x|y|a|n)\s*([+\-−])\s*(\d+)\)$/i);
  const linearPlusBracketMatch = cleanEq.match(/^(\d*x|\d*y|\d*a|\d*n)\s*([+\-−])\s*(\d+)\((x|y|a|n)\s*([+\-−])\s*(\d+)\)\s*=\s*(\d+)$/i);

  let parts = [];
  let story = [];
  let chips = [];

  const correctOpt = rawQ.options?.find(o => o.correct) || rawQ.options?.[0];

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

    const phrase1 = `${num} ${theme.item} at x rupees each`;
    const phrase2 = isMinus ? `₹${term2} discount coupon` : `₹${term2} ${theme.feeText}`;
    const phrase3 = `₹${total} total bill`;

    story = [
      { txt: `${name} bought` },
      { need: term1, fill: phrase1 },
      { txt: isMinus ? 'applied a' : 'and paid' },
      { need: term2, fill: phrase2 },
      { txt: 'making the total' },
      { need: total, fill: phrase3 }
    ];

    const distractorSign = isMinus
      ? `₹${term2} ${theme.feeText} added`
      : `₹${term2} discount coupon`;

    const distractorPerItem = isMinus
      ? `₹${term2} discount on EACH ${theme.unit}`
      : `₹${term2} ${theme.feeText} on EACH ${theme.unit}`;

    const distractorSwap = `${term2} ${theme.item} at x rupees each`;

    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: term2, e: isMinus ? theme.discEmoji : theme.feeEmoji, t: phrase2 },
      { v: total, e: theme.totalEmoji, t: phrase3 },
      { v: 'err_sign', e: isMinus ? theme.feeEmoji : theme.discEmoji, t: distractorSign, err: isMinus ? `Notice the minus sign (−${term2})! A fee ADDS money (+), but a discount SUBTRACTS money (−)!` : `Notice the plus sign (+${term2})! A discount takes money off (−), but a fee ADDS money (+)!` },
      { v: 'err_per_item', e: '🏷️', t: distractorPerItem, err: `₹${term2} per ${theme.unit} would be written with brackets as ${num}(x ${isMinus ? '−' : '+'} ${term2})! Here it's a flat one-off ${isMinus ? 'discount' : 'fee'}.` },
      { v: 'err_swap', e: theme.emoji, t: distractorSwap, err: `Look at ${term1} — the quantity of ${theme.item} multiplying x is ${num}, not ${term2}!` }
    ];
  } else if (tripleTermMatch) {
    const [, term1, op1, term2, op2, val, total] = tripleTermMatch;
    const isMinus1 = op1 === '-' || op1 === '−';
    const isMinus2 = op2 === '-' || op2 === '−';
    const num1 = term1.replace(/\D/g, '') || '1';
    const num2 = term2.replace(/\D/g, '') || '1';

    parts = [
      { t: term1, c: 0 },
      { t: isMinus1 ? '−' : '+', s: 1 },
      { t: term2, c: 1 },
      { t: isMinus2 ? '−' : '+', s: 1 },
      { t: val, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];

    const phrase1 = `${num1} morning shifts at x rupees each`;
    const phrase2 = isMinus1 ? `${num2} tax shifts at x rupees each` : `${num2} bonus shifts at x rupees each`;
    const phrase3 = isMinus2 ? `₹${val} discount` : `₹${val} added savings`;
    const phrase4 = `₹${total} net total`;

    story = [
      { txt: `${name} worked` },
      { need: term1, fill: phrase1 },
      { txt: isMinus1 ? 'minus' : 'plus' },
      { need: term2, fill: phrase2 },
      { txt: isMinus2 ? 'minus' : 'plus' },
      { need: val, fill: phrase3 },
      { txt: 'making' },
      { need: total, fill: phrase4 }
    ];

    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: term2, e: isMinus1 ? '💸' : theme.feeEmoji, t: phrase2 },
      { v: val, e: isMinus2 ? theme.discEmoji : '💰', t: phrase3 },
      { v: total, e: theme.totalEmoji, t: phrase4 },
      { v: 'err_swap', e: theme.emoji, t: `${num2} morning shifts at x rupees each`, err: `Check the first term (${term1}) — the quantity is ${num1}, not ${num2}!` }
    ];
  } else if (bracketPlusFlatMatch) {
    const [, mult, varN, op1, bVal, op2, flatVal, total] = bracketPlusFlatMatch;
    const isMinus1 = op1 === '-' || op1 === '−';
    const isMinus2 = op2 === '-' || op2 === '−';
    const bracketTerm = `(${varN} ${isMinus1 ? '−' : '+'} ${bVal})`;

    parts = [
      { t: mult, c: 0 },
      { t: bracketTerm, c: 1 },
      { t: isMinus2 ? '−' : '+', s: 1 },
      { t: flatVal, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];

    const phrase1 = `${mult} gift boxes`;
    const phrase2 = `(x ${isMinus1 ? 'minus' : 'plus'} ₹${bVal} per box)`;
    const phrase3 = isMinus2 ? `₹${flatVal} checkout coupon deducted` : `₹${flatVal} flat shipping fee`;
    const phrase4 = `₹${total} final bill`;

    story = [
      { txt: `${name} bought` },
      { need: mult, fill: phrase1 },
      { txt: 'each costing' },
      { need: bracketTerm, fill: phrase2 },
      { txt: isMinus2 ? 'minus' : 'plus' },
      { need: flatVal, fill: phrase3 },
      { txt: 'totaling' },
      { need: total, fill: phrase4 }
    ];

    chips = [
      { v: mult, e: '📦', t: phrase1 },
      { v: bracketTerm, e: theme.emoji, t: phrase2 },
      { v: flatVal, e: isMinus2 ? theme.discEmoji : theme.feeEmoji, t: phrase3 },
      { v: total, e: theme.totalEmoji, t: phrase4 },
      { v: 'err_flat', e: '🏷️', t: `flat ₹${bVal} fee added once`, err: `₹${bVal} is inside the bracket ${bracketTerm}, meaning it applies per box, not once!` }
    ];
  } else if (linearEqualsBracketMatch) {
    const [, term1, op1, flatVal, mult, varN, op2, bVal] = linearEqualsBracketMatch;
    const isMinus1 = op1 === '-' || op1 === '−';
    const isMinus2 = op2 === '-' || op2 === '−';
    const num1 = term1.replace(/\D/g, '') || '1';
    const bracketTerm = `(${varN} ${isMinus2 ? '−' : '+'} ${bVal})`;

    parts = [
      { t: term1, c: 0 },
      { t: isMinus1 ? '−' : '+', s: 1 },
      { t: flatVal, c: 1 },
      { t: '=', s: 1 },
      { t: mult, c: 0 },
      { t: bracketTerm, c: 1 }
    ];

    const phrase1 = `Plan A: ${num1} months at x rupees/mo`;
    const phrase2 = isMinus1 ? `₹${flatVal} setup discount` : `₹${flatVal} setup fee`;
    const phrase3 = `Plan B: ${mult} payments`;
    const phrase4 = `(x ${isMinus2 ? 'minus' : 'plus'} ₹${bVal} per payment)`;

    story = [
      { txt: `${name} compares` },
      { need: term1, fill: phrase1 },
      { txt: isMinus1 ? 'minus' : 'plus' },
      { need: flatVal, fill: phrase2 },
      { txt: 'equals' },
      { need: mult, fill: phrase3 },
      { txt: 'each of' },
      { need: bracketTerm, fill: phrase4 }
    ];

    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: flatVal, e: isMinus1 ? theme.discEmoji : theme.feeEmoji, t: phrase2 },
      { v: mult, e: '💳', t: phrase3 },
      { v: bracketTerm, e: theme.emoji, t: phrase4 },
      { v: 'err_swap', e: theme.emoji, t: `Plan A: ${mult} months at x rupees/mo`, err: `Plan A has term ${term1}, which means ${num1} months, not ${mult}!` }
    ];
  } else if (doubleBracketMatch) {
    const [, mult1, varN1, op1, bVal1, mult2, varN2, op2, bVal2] = doubleBracketMatch;
    const isMinus1 = op1 === '-' || op1 === '−';
    const isMinus2 = op2 === '-' || op2 === '−';
    const bracket1 = `(${varN1} ${isMinus1 ? '−' : '+'} ${bVal1})`;
    const bracket2 = `(${varN2} ${isMinus2 ? '−' : '+'} ${bVal2})`;

    parts = [
      { t: mult1, c: 0 },
      { t: bracket1, c: 1 },
      { t: '=', s: 1 },
      { t: mult2, c: 0 },
      { t: bracket2, c: 1 }
    ];

    const phrase1 = `Bundle A: ${mult1} bags`;
    const phrase2 = `(x ${isMinus1 ? 'minus' : 'plus'} ₹${bVal1} per bag)`;
    const phrase3 = `Bundle B: ${mult2} larger bags`;
    const phrase4 = `(x ${isMinus2 ? 'minus' : 'plus'} ₹${bVal2} per bag)`;

    story = [
      { txt: `${name} checks` },
      { need: mult1, fill: phrase1 },
      { txt: 'at' },
      { need: bracket1, fill: phrase2 },
      { txt: 'equals' },
      { need: mult2, fill: phrase3 },
      { txt: 'at' },
      { need: bracket2, fill: phrase4 }
    ];

    chips = [
      { v: mult1, e: '🎒', t: phrase1 },
      { v: bracket1, e: theme.emoji, t: phrase2 },
      { v: mult2, e: '🎒', t: phrase3 },
      { v: bracket2, e: theme.emoji, t: phrase4 },
      { v: 'err_swap', e: '🎒', t: `Bundle A: ${mult2} bags`, err: `Bundle A quantity is ${mult1}, not ${mult2}!` }
    ];
  } else if (linearPlusBracketMatch) {
    const [, term1, op1, mult, varN, op2, bVal, total] = linearPlusBracketMatch;
    const isMinus1 = op1 === '-' || op1 === '−';
    const isMinus2 = op2 === '-' || op2 === '−';
    const num1 = term1.replace(/\D/g, '') || '1';
    const bracketTerm = `(${varN} ${isMinus2 ? '−' : '+'} ${bVal})`;

    parts = [
      { t: term1, c: 0 },
      { t: isMinus1 ? '−' : '+', s: 1 },
      { t: mult, c: 0 },
      { t: bracketTerm, c: 1 },
      { t: '=', s: 1 },
      { t: total, c: 2 }
    ];

    const phrase1 = `${num1} standard items at x rupees each`;
    const phrase2 = `${mult} premium items`;
    const phrase3 = `(x ${isMinus2 ? 'minus' : 'plus'} ₹${bVal} per item)`;
    const phrase4 = `₹${total} total bill`;

    story = [
      { txt: `${name} bought` },
      { need: term1, fill: phrase1 },
      { txt: isMinus1 ? 'minus' : 'plus' },
      { need: mult, fill: phrase2 },
      { txt: 'each at' },
      { need: bracketTerm, fill: phrase3 },
      { txt: 'for total' },
      { need: total, fill: phrase4 }
    ];

    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: mult, e: '⭐', t: phrase2 },
      { v: bracketTerm, e: theme.emoji, t: phrase3 },
      { v: total, e: theme.totalEmoji, t: phrase4 },
      { v: 'err_swap', e: theme.emoji, t: `${mult} standard items at x rupees each`, err: `Standard items quantity is ${num1}, not ${mult}!` }
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

    const phrase1 = `${name1} buys ${num1} ${theme.item} at x rupees each`;
    const phrase2 = isMinus1 ? `₹${term2} discount coupon` : `₹${term2} ${theme.feeText}`;
    const phrase3 = `${name2} buys ${num3} ${theme.item} at x rupees each`;
    const phrase4 = isMinus2 ? `₹${term4} discount coupon` : `₹${term4} ${theme.feeText}`;

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
      { v: 'err_swap_qty', e: theme.emoji, t: `${name1} buys ${num3} ${theme.item} at x rupees each`, err: `Look at ${name1}'s term (${term1}) — ${name1} buys ${num1} ${theme.item}, not ${num3}!` },
      { v: 'err_swap_fee', e: '🏷️', t: `₹${term4} ${theme.feeText} for ${name1}`, err: `${name1}'s side on the left has ₹${term2}, so ${name1}'s ${theme.feeText} is ₹${term2}, not ₹${term4}!` },
      { v: 'err_sign', e: isMinus1 ? theme.feeEmoji : theme.discEmoji, t: isMinus1 ? `₹${term2} ${theme.feeText} for ${name1}` : `₹${term2} discount for ${name1}`, err: isMinus1 ? `Notice the minus sign (−${term2}) for ${name1}! A fee ADDS money (+), but a discount SUBTRACTS money (−)!` : `Notice the plus sign (+${term2}) for ${name1}! A discount takes money off (−), but a fee ADDS money (+)!` }
    ];
  } else if (multMatch) {
    const [, term1, total] = multMatch;
    const num = term1.replace(/\D/g, '') || '1';
    parts = [
      { t: term1, c: 0 },
      { t: '=', s: 1 },
      { t: total, c: 1 }
    ];
    const phrase1 = `${num} ${theme.item} at x rupees each`;
    const phrase2 = `₹${total} in total`;
    story = [
      { txt: `${name} ordered` },
      { need: term1, fill: phrase1 },
      { txt: 'totaling' },
      { need: total, fill: phrase2 }
    ];
    chips = [
      { v: term1, e: theme.emoji, t: phrase1 },
      { v: total, e: theme.totalEmoji, t: phrase2 },
      { v: 'err_swap', e: theme.emoji, t: `${total} ${theme.item} at x rupees each`, err: `Look at ${term1} — the quantity of ${theme.item} is ${num}, not ${total}!` },
      { v: 'err_const', e: '🏷️', t: `${num} ${theme.item} at ₹${total} each`, err: `₹${total} is the total bill on the right of the equals sign (=), not the price per item!` }
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
    const phrase2 = `(${varN} ${isMinus ? 'minus' : 'plus'} ₹${val} per ${theme.unit})`;
    const phrase3 = `₹${total} altogether`;
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
      { v: 'err_flat', e: '🏷️', t: `flat ₹${val} fee added once`, err: `The term is inside brackets (${bracketTerm}), meaning it applies to EACH item, not just once!` },
      { v: 'err_sign', e: theme.emoji, t: `(${varN} ${isMinus ? 'plus' : 'minus'} ₹${val} per ${theme.unit})`, err: `Notice the operator inside the bracket is ${op}! Check the sign (+ vs −) carefully.` }
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
    const phrase1 = `${num1} ${isMinus ? 'batches produced' : 'morning shifts at x rupees each'}`;
    const phrase2 = isMinus ? `${num2} defective batches subtracted` : `${num2} evening shifts at x rupees each`;
    const phrase3 = isMinus ? `${total} good units remaining` : `₹${total} total earnings`;
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
      { v: term2, e: isMinus ? '❌' : theme.feeEmoji, t: phrase2 },
      { v: total, e: theme.totalEmoji, t: phrase3 },
      { v: 'err_const', e: '🏷️', t: `₹${num1} flat morning bonus`, err: `${term1} represents quantity times x, not a flat ₹${num1}!` },
      { v: 'err_swap', e: theme.emoji, t: `${num2} morning shifts at x rupees each`, err: `First term is ${term1}, which has quantity ${num1}, not ${num2}!` }
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
    const phrase2 = isMinus ? `₹${val} coupon deducted` : `₹${val} added`;
    const phrase3 = `₹${total} total`;
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
    const phrase2 = `(${innerTerm} ${isMinus ? 'minus' : 'plus'} ₹${val} per box)`;
    const phrase3 = `₹${total} total cost`;
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
      { v: 'err_sign', e: theme.emoji, t: `(${innerTerm} ${isMinus ? 'plus' : 'minus'} ₹${val} per box)`, err: `Notice the operator inside the bracket is ${op}! Check the sign (+ vs −) carefully.` }
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

  let qText = rawQ.prompt || 'Pick the story that matches the equation:';
  let opts = [];
  let ans = 0;
  let why = rawQ.explanation || `Solving ${cleanEq} for ${name}'s ${theme.item}.`;

  if (rawQ.prompt && rawQ.options && rawQ.options.length > 0) {
    opts = rawQ.options.map(o => o.text);
    ans = rawQ.options.findIndex(o => o.correct);
    if (ans < 0) ans = 0;
    qText = rawQ.prompt;
  } else {
    // Build the exact story sentence from story structure
    const builtCorrect = story.map(s => s.txt || s.fill).join(' ');

    // Extract distractor chip phrases
    const errChips = chips.filter(c => c.v.startsWith('err') || c.err);
    const dist1Text = errChips[0] ? errChips[0].t : null;
    const dist2Text = errChips[1] ? errChips[1].t : null;
    const dist3Text = errChips[2] ? errChips[2].t : null;

    const fillSlotWithDistractor = (distText, targetSlotIndex = 0) => {
      let fillCount = 0;
      return story.map(s => {
        if (s.txt) return s.txt;
        if (fillCount === targetSlotIndex && distText) {
          fillCount++;
          return distText;
        }
        fillCount++;
        return s.fill;
      }).join(' ');
    };

    const d1 = dist1Text ? fillSlotWithDistractor(dist1Text, 0) : builtCorrect.replace(/\d+/g, m => String(Number(m) * 2));
    const d2 = dist2Text ? fillSlotWithDistractor(dist2Text, 1) : builtCorrect.replace(/\d+/g, m => String(Number(m) + 5));
    const d3 = dist3Text ? fillSlotWithDistractor(dist3Text, 0) : builtCorrect.replace(/\+/g, '−');

    // Ensure all options are unique
    const uniqueOpts = Array.from(new Set([builtCorrect, d1, d2, d3]));
    let fillCounter = 1;
    while (uniqueOpts.length < 4) {
      uniqueOpts.push(`${name}'s total bill: ₹${999 + fillCounter * 50}`);
      fillCounter++;
    }

    const shuffled = shuffle([
      { text: uniqueOpts[0], correct: true },
      { text: uniqueOpts[1], correct: false },
      { text: uniqueOpts[2], correct: false },
      { text: uniqueOpts[3], correct: false },
    ]);

    opts = shuffled.map(o => o.text);
    ans = shuffled.findIndex(o => o.correct);
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
    const rawQs = buildShuffled(idx);
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

      const activeQ = getInteractiveQuestion(shuffledQuestions[qIndex], qIndex);
      const required = activeQ.story.filter(s => s.need).map(s => s.need);
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


  const handleAnswerSelect = (index, activeQ) => {
    if (answered || wrongAnswers.has(index)) return;

    if (index === activeQ.ans) {
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
      say(`${activeQ.why}  (+${bonus} speed bonus 🔥)`, 'ok');
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
            Turn equations into real stories — practice and master each level!
          </p>
        </div>

        {/* Level map dots strip */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          {MODULES.map((mod, idx) => {
            const isDone = completedLevels.has(idx);
            const isCurrent = idx === currentLevel;
            const isUnlocked = idx === 0 || completedLevels.has(idx - 1);
            return (
              <div key={idx}
                onClick={() => { if (isUnlocked) startModule(idx); }}
                style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  fontSize: '0.8rem', fontWeight: 800,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  background: isDone ? PAL.leaf : isCurrent && isUnlocked ? PAL.sky : isUnlocked ? 'var(--clr-surface)' : 'rgba(128,128,128,0.15)',
                  color: isDone || (isCurrent && isUnlocked) ? '#fff' : isUnlocked ? 'var(--clr-text)' : 'var(--clr-text-soft)',
                  border: `2px solid ${isDone ? '#17a389' : isCurrent && isUnlocked ? '#1f9fd4' : 'var(--clr-border)'}`,
                  transform: isCurrent && isUnlocked ? 'scale(1.15)' : 'none',
                  boxShadow: isCurrent && isUnlocked ? `0 0 0 3px ${PAL.sky}44` : 'none',
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: 'transform 0.2s', fontFamily: "'Baloo 2',system-ui,sans-serif",
                }}
                title={isUnlocked ? `Play Level ${idx + 1}` : `Pass Level ${idx} with 80%+ to unlock Level ${idx + 1}`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
            );
          })}
        </div>

        {/* Module cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 14, marginBottom: 20 }}>
          {MODULES.map((mod, idx) => {
            const isCurrent = idx === currentLevel;
            const isDone = completedLevels.has(idx);
            const isUnlocked = idx === 0 || completedLevels.has(idx - 1);
            const accent = MOD_COLORS[idx] || PAL.grape;
            return (
              <button key={idx} className="sq-card"
                disabled={!isUnlocked}
                onClick={() => { if (isUnlocked) startModule(idx); }}
                style={{
                  background: isUnlocked ? 'var(--clr-surface)' : 'rgba(128,128,128,0.06)',
                  border: isCurrent && isUnlocked ? `2.5px solid ${accent}` : isDone ? `2.5px solid ${accent}55` : '2px solid var(--clr-border)',
                  borderRadius: 20, padding: '18px 18px 16px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed', textAlign: 'left',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  position: 'relative', minHeight: 110,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: isUnlocked ? '0 4px 0 rgba(0,0,0,0.06)' : 'none', overflow: 'hidden',
                  opacity: isUnlocked ? 1 : 0.55,
                }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: isUnlocked ? accent : 'var(--clr-border)', borderRadius: '20px 0 0 20px' }} />
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isUnlocked ? accent : 'var(--clr-text-soft)' }}>Level {idx + 1}</span>
                    {isDone && <span style={{ fontSize: '0.9rem', color: PAL.leaf }}>✓</span>}
                    {isCurrent && isUnlocked && !isDone && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: PAL.sky, background: `${PAL.sky}22`, padding: '2px 8px', borderRadius: 999 }}>Current</span>}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isUnlocked ? 'var(--clr-text)' : 'var(--clr-text-soft)', lineHeight: 1.25, marginBottom: 8, fontFamily: "'Baloo 2',system-ui,sans-serif" }}>{mod.title}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--clr-text-soft)' }}>
                    {`${mod.questions.length} questions`}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Custom Test card */}
          {(() => {
            const allCompleted = MODULES.every((_, i) => completedLevels.has(i));
            return (
              <button className="sq-card"
                disabled={!allCompleted}
                onClick={() => {
                  if (allCompleted) {
                    setActiveModule('custom');
                    setIsCustomSetup(true);
                  }
                }}
                style={{
                  background: allCompleted ? 'var(--clr-surface)' : 'rgba(128,128,128,0.06)',
                  border: `2px dashed ${allCompleted ? PAL.grape + '77' : 'var(--clr-border)'}`,
                  borderRadius: 20, padding: '18px 18px 16px',
                  cursor: allCompleted ? 'pointer' : 'not-allowed', textAlign: 'left',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: allCompleted ? '0 4px 0 rgba(0,0,0,0.06)' : 'none', overflow: 'hidden', position: 'relative',
                  opacity: allCompleted ? 1 : 0.55,
                }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: allCompleted ? PAL.grape : 'var(--clr-border)', borderRadius: '20px 0 0 20px' }} />
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: allCompleted ? PAL.grape : 'var(--clr-text-soft)' }}>⚡ Custom</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)' }}>10–100 Qs</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: allCompleted ? 'var(--clr-text)' : 'var(--clr-text-soft)', lineHeight: 1.25, marginBottom: 8, fontFamily: "'Baloo 2',system-ui,sans-serif" }}>Custom Test</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--clr-text-soft)' }}>
                    Algorithm-generated
                  </div>
                </div>
              </button>
            );
          })()}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: '0.77rem', color: 'var(--clr-text-soft)', flexWrap: 'wrap' }}>
          <span><span style={{ color: PAL.sky }}>● Current</span> — active level</span>
          <span><span style={{ color: PAL.leaf }}>✓ Passed</span> — scored ≥80% to unlock next level</span>
        </div>
      </div>
    );
  }

  // ── Finished Screen ──────────────────────────────────────────────────────
  if (finished) {
    const total = shuffledQuestions.length;
    const correctCount = Math.round(score / 50);
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
            Question {qIndex + 1} of {shuffledQuestions.length} — read the equation
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
        {storyCompleted && (
          <div style={{ marginTop: 18, animation: 'sq-fade 0.3s ease-out' }}>
            <div style={{
              background: `${PAL.leaf}18`, border: `3px solid ${PAL.leaf}`,
              borderRadius: 20, padding: 14, fontSize: 'clamp(14px,3vw,19px)',
              textAlign: 'center', fontWeight: 700, color: PAL.leaf, marginBottom: 16,
              fontFamily: "'Baloo 2',system-ui,sans-serif",
            }}>
              📖 “{currentQ.story.map(s => s.txt || s.fill).join(' ')}.”
            </div>

            {/* Header */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ background: PAL.berry, color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>
                3
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
