import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vachana_schema_progress';

const SCHEMA_OPTIONS = [
  'Combine',
  'Compare',
  'Change',
  'Compare+Combine',
  'Change+Compare',
  'Compare+Change',
  'Combine+Change+Compare',
  'Compare+Combine+Change'
];

const LEVEL_METADATA = {
  0: { title: 'Level 0: Schema Introduction', desc: 'Interactive toy tutorial explaining Combine, Compare, and Change' },
  1: { title: 'Level 1: Single-Step Basics', desc: 'Identify single-operation schemas with small numbers (12 questions)' },
  2: { title: 'Level 2: Multi-Digit Single-Step', desc: 'Classify single-operation schemas with multi-digit numbers (12 questions)' },
  3: { title: 'Level 3: Multi-Step Reasoning', desc: 'Identify single schema types across multi-step action sequences (12 questions)' },
  4: { title: 'Level 4: Complex Reasoning Chains', desc: 'Analyze long reasoning narratives with single schema focus (12 questions)' },
  5: { title: 'Level 5: Single-Entity Compound Schemas', desc: 'Analyze scenarios combining 2 schema types for a single subject (12 questions)' },
  6: { title: 'Level 6: Multi-Entity Compound Schemas', desc: 'Evaluate multi-entity scenarios with 2-3 active schema transitions (12 questions)' },
  7: { title: 'Level 7: Proportional & Percentage Schemas', desc: 'Solve percentage-based multi-entity compound schemas (12 questions)' }
};

// Order-independent schema comparison helper
function pluralize(count, singular, plural = singular + 's') {
  return `${count} ${count === 1 ? singular : plural}`;
}

function isSchemaMatch(userChoice, correctChoice) {
  if (!userChoice || !correctChoice) return false;
  const normUser = userChoice
    .split('+')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join('+');
  const normCorrect = correctChoice
    .split('+')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join('+');
  return normUser === normCorrect;
}

// Fisher-Yates shuffle utility (unbiased uniform shuffle)
function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Build stable 4-option set (1 correct + 3 distinct distractors) for compound schema questions
function generateOptionsForQuestion(question, activeLevel) {
  if (activeLevel >= 1 && activeLevel <= 4) {
    return fisherYatesShuffle(['Combine', 'Compare', 'Change']);
  }

  const correctOpt = SCHEMA_OPTIONS.find(opt => isSchemaMatch(opt, question?.type)) || question?.type || 'Combine';

  // Candidate pool of potential distractors
  const distractors = SCHEMA_OPTIONS.filter(opt => !isSchemaMatch(opt, correctOpt));
  const shuffledDistractors = fisherYatesShuffle(distractors);

  // Take 3 distractors and combine with correct answer, then shuffle once
  const fourOptions = fisherYatesShuffle([correctOpt, ...shuffledDistractors.slice(0, 3)]);
  return fourOptions;
}

const QUESTIONS_BY_LEVEL = {
  1: [
    { id: 'l1_q1', text: 'Aarav has 7 pencils and Rohan has 9 pencils. How many pencils do they have altogether?', type: 'Combine', hint: 'Look at what is happening to the two groups of pencils. Are you putting separate groups together into a single total, or comparing them?' },
    { id: 'l1_q2', text: 'Meera has 18 chocolates. She has 6 more chocolates than Siya. How many chocolates does Siya have?', type: 'Compare', hint: 'Notice how Meera\'s chocolates are described relative to Siya\'s. Are you finding a combined total, comparing two quantities, or tracking a change over time?' },
    { id: 'l1_q3', text: 'Kabir had 21 marbles and gave 8 to his friend. How many marbles does he have now?', type: 'Change', hint: 'Consider what happens to Kabir\'s marbles after giving some away. Is an initial amount changing over time, being compared, or combined?' },
    { id: 'l1_q4', text: 'A basket contains 11 apples and 13 oranges. How many fruits are in the basket?', type: 'Combine', hint: 'Focus on the two fruit types in the basket. Are you combining two distinct subsets into one overall total count?' },
    { id: 'l1_q5', text: 'Riya has 25 stickers. She has 7 more stickers than Ananya. How many stickers does Ananya have?', type: 'Compare', hint: 'Look at how Riya\'s sticker count compares to Ananya\'s. Are you measuring the difference between two quantities?' },
    { id: 'l1_q6', text: 'Rahul had 19 balloons. He lost 5 balloons. How many balloons does he have left?', type: 'Change', hint: 'Think about Rahul\'s balloons before and after losing some. Did an initial quantity experience a change over time?' },
    { id: 'l1_q7', text: 'A toy box has 14 toy cars and 8 toy trains. How many toys are in the box?', type: 'Combine', hint: 'Consider the toy cars and toy trains together. Are you totaling different categories into one overall box collection?' },
    { id: 'l1_q8', text: 'Vikram has 24 coins. He has 9 more coins than Arjun. How many coins does Arjun have?', type: 'Compare', hint: 'Notice the comparison between Vikram\'s coins and Arjun\'s coins. Are you evaluating the relative difference between two amounts?' },
    { id: 'l1_q9', text: 'Sneha had 30 flowers. She gave 12 flowers to her teacher. How many flowers remain?', type: 'Change', hint: 'Track Sneha\'s flowers before and after giving some to her teacher. Is an initial stock undergoing a decrease?' },
    { id: 'l1_q10', text: 'There are 15 boys and 12 girls in a class. How many students are there altogether?', type: 'Combine', hint: 'Look at the boys and girls in the class. Are you combining two parts to find the grand total of students?' },
    { id: 'l1_q11', text: 'Dev has 29 books. He has 11 more books than Kunal. How many books does Kunal have?', type: 'Compare', hint: 'Notice how Dev\'s book count is described relative to Kunal\'s. Are you comparing two separate quantities?' },
    { id: 'l1_q12', text: 'Anika had 26 crayons. She used 9 crayons. How many crayons are left?', type: 'Change', hint: 'Think about Anika\'s crayons before and after using 9 of them. Did her starting amount decrease over time?' }
  ],
  2: [
    { id: 'l2_q1', text: 'A library has 425 storybooks and 318 science books. How many books are there in total?', type: 'Combine', hint: 'Look at the two distinct categories of books. Are you putting separate groups together into a single total, or comparing them?' },
    { id: 'l2_q2', text: 'A train has 640 passengers. It has 185 more passengers than a bus. How many passengers are on the bus?', type: 'Compare', hint: 'Notice how the train\'s passengers are described relative to the bus. Are you finding a grand total, comparing two quantities, or tracking a change over time?' },
    { id: 'l2_q3', text: 'A warehouse had 980 boxes. It shipped 365 boxes. How many boxes remain?', type: 'Change', hint: 'Consider what happens to the warehouse stock after shipping boxes out. Is the starting inventory changing over time, being compared, or combined?' },
    { id: 'l2_q4', text: 'A school has 512 boys and 468 girls. How many students are there altogether?', type: 'Combine', hint: 'Focus on the boys and girls in the school. Are you combining two subsets into one overall total count?' },
    { id: 'l2_q5', text: 'A company employs 845 workers. This is 210 more workers than another company. How many workers does the other company employ?', type: 'Compare', hint: 'Look at how one company\'s workforce compares to another company\'s. Are you measuring the difference between two quantities?' },
    { id: 'l2_q6', text: 'A factory stored 1,250 units. It sold 485 units. How many units remain?', type: 'Change', hint: 'Think about the factory stock before and after selling units. Did an initial quantity experience a change over time?' },
    { id: 'l2_q7', text: 'A supermarket has 286 bottles of juice and 394 bottles of milk. How many bottles are there altogether?', type: 'Combine', hint: 'Consider the bottles of juice and bottles of milk together. Are you totaling different categories into one overall collection?' },
    { id: 'l2_q8', text: 'A hotel has 720 rooms. This is 165 more rooms than another hotel. How many rooms does the other hotel have?', type: 'Compare', hint: 'Notice the comparison between room counts of the two hotels. Are you evaluating the relative difference between two amounts?' },
    { id: 'l2_q9', text: 'A shop had 930 mobile covers. It sold 278 covers. How many covers remain?', type: 'Change', hint: 'Track the mobile covers before and after selling 278 covers. Is an initial stock undergoing a decrease?' },
    { id: 'l2_q10', text: 'A warehouse stores 540 chairs and 285 tables. How many pieces of furniture are there altogether?', type: 'Combine', hint: 'Look at the chairs and tables stored in the warehouse. Are you combining two parts to find the grand total of furniture?' },
    { id: 'l2_q11', text: 'A stadium has 1,150 seats. This is 320 more seats than a nearby stadium. How many seats does the nearby stadium have?', type: 'Compare', hint: 'Notice how one stadium\'s capacity is described relative to the nearby stadium. Are you comparing two separate quantities?' },
    { id: 'l2_q12', text: 'A bakery baked 875 loaves of bread. It sold 296 loaves. How many loaves remain?', type: 'Change', hint: 'Think about the bakery\'s bread before and after selling 296 loaves. Did the starting amount decrease over time?' }
  ],
  3: [
    { id: 'l3_q1', text: 'A classroom has 28 boys and 24 girls. Later, 8 more girls join the class. How many students are in the classroom now?', type: 'Combine', hint: 'Look at all the students in the classroom across boys and girls after new admissions. Are you putting different parts together to find the overall total?' },
    { id: 'l3_q2', text: 'A bookstore has 65 novels and 42 comics. It receives 18 more novels. How many books does the bookstore have now?', type: 'Combine', hint: 'Consider all the books in the bookstore across novels and comics after receiving more. Are you finding the combined total count?' },
    { id: 'l3_q3', text: 'A fruit seller has 48 apples and 36 oranges. Later, he buys 20 more oranges. How many fruits does he have now?', type: 'Combine', hint: 'Focus on all the fruits in the store across apples and oranges after buying more. Are you finding the grand total across both fruit types?' },
    { id: 'l3_q4', text: 'A warehouse stores 120 chairs and 85 tables. It receives 35 more chairs. How many pieces of furniture are there now?', type: 'Combine', hint: 'Look at the chairs and tables stored in the warehouse after receiving additional chairs. Are you combining different categories into a total furniture count?' },
    { id: 'l3_q5', text: 'A zoo has 45 monkeys and 38 deer. It receives 12 more deer. How many animals are there now?', type: 'Combine', hint: 'Consider the monkeys and deer in the zoo after new deer arrive. Are you putting all animal categories together to find the overall total?' },
    { id: 'l3_q6', text: 'Rohan scored 58 marks in Science. Aman scored 14 more than Rohan. Neha scored 9 less than Aman. How many marks did Neha score?', type: 'Compare', hint: 'Pay attention to how Rohan, Aman, and Neha\'s scores relate to one another. Are you evaluating relative differences between individuals?' },
    { id: 'l3_q7', text: 'A red rope is 90 cm long. A blue rope is 18 cm shorter than the red rope. A green rope is 24 cm longer than the blue rope. How long is the green rope?', type: 'Compare', hint: 'Focus on the lengths of the red, blue, and green ropes relative to each other. Are you measuring comparative differences between items?' },
    { id: 'l3_q8', text: 'Priya has ₹250. Kavya has ₹45 more than Priya. Riya has ₹30 less than Kavya. How much money does Riya have?', type: 'Compare', hint: 'Analyze the relative money amounts among Priya, Kavya, and Riya. Are you comparing relative amounts across individuals?' },
    { id: 'l3_q9', text: 'A train travels 420 km. Another train travels 65 km more. A third train travels 40 km less than the second train. How far does the third train travel?', type: 'Compare', hint: 'Trace the distance traveled by each train relative to the others. Are you calculating comparative differences across the three trains?' },
    { id: 'l3_q10', text: 'Arjun is 15 years old. Kabir is 4 years older than Arjun. Rahul is 3 years younger than Kabir. How old is Rahul?', type: 'Compare', hint: 'Look at the age relationships between Arjun, Kabir, and Rahul. Are you evaluating relative age differences between people?' },
    { id: 'l3_q11', text: 'Sneha had 95 stickers. She gave 28 stickers to her cousin, bought 16 new stickers, then gave away 12 more. How many stickers does she have now?', type: 'Change', hint: 'Trace Sneha\'s sticker count step-by-step. Is her initial amount undergoing a sequence of increases and decreases over time?' },
    { id: 'l3_q12', text: 'A water tank contained 750 liters. It supplied 180 liters in the morning, received 220 liters in the afternoon, and supplied another 140 liters in the evening. How much water remains?', type: 'Change', hint: 'Track the water level in the tank through morning, afternoon, and evening operations. Is a single initial volume undergoing a series of additions and subtractions?' }
  ],
  4: [
    { id: 'l4_q1', text: 'A stationery shop has 145 notebooks, 92 pens, 76 erasers, and 48 rulers. How many stationery items are there altogether?', type: 'Combine', hint: 'Look at the four distinct categories of stationery. Are you combining all separate items into one single total count?' },
    { id: 'l4_q2', text: 'A school has 380 students in Grade 6, 410 in Grade 7, 395 in Grade 8, and 420 in Grade 9. How many students are there in total?', type: 'Combine', hint: 'Consider the student counts across all four grade levels. Are you putting all parts together to find the full school total?' },
    { id: 'l4_q3', text: 'A warehouse stores 250 chairs, 185 tables, 320 stools, and 145 cupboards. How many pieces of furniture are there altogether?', type: 'Combine', hint: 'Look at the four different categories of furniture in the warehouse. Are you adding all subcategories into one grand total?' },
    { id: 'l4_q4', text: 'A supermarket has 540 juice bottles, 385 milk bottles, 275 soft drink bottles, and 310 water bottles. How many bottles are there altogether?', type: 'Combine', hint: 'Consider all four bottle types in the supermarket. Are you combining four distinct subsets into one overall total count?' },
    { id: 'l4_q5', text: 'A zoo has 85 lions, 132 deer, 64 zebras, and 47 elephants. How many animals are there in total?', type: 'Combine', hint: 'Look at the four animal species in the zoo. Are you putting all animal categories together to find the total zoo population?' },
    { id: 'l4_q6', text: 'A library contains 620 novels, 340 science books, 280 history books, and 160 dictionaries. How many books does the library have altogether?', type: 'Combine', hint: 'Consider the four genre categories of books in the library. Are you totaling all sub-groups into one single total count?' },
    { id: 'l4_q7', text: 'Rohan has ₹450. Aman has ₹85 more than Rohan. Neha has ₹40 less than Aman. Rahul has ₹65 more than Neha. How much money does Rahul have?', type: 'Compare', hint: 'Follow the chain of relative money relationships across Rohan, Aman, Neha, and Rahul. Are you evaluating relative comparisons from one person to the next?' },
    { id: 'l4_q8', text: 'Team A scored 280 runs. Team B scored 42 fewer than Team A. Team C scored 58 more than Team B. Team D scored 36 fewer than Team C. How many runs did Team D score?', type: 'Compare', hint: 'Trace the comparative score differences across Team A, Team B, Team C, and Team D. Are you calculating relative score comparisons across multiple teams?' },
    { id: 'l4_q9', text: 'A building is 180 meters tall. Another building is 35 meters shorter. A third building is 50 meters taller than the second. A fourth building is 28 meters shorter than the third. What is the height of the fourth building?', type: 'Compare', hint: 'Follow the relative height differences across the four buildings in sequence. Are you evaluating comparative differences from one building to another?' },
    { id: 'l4_q10', text: 'Maya scored 78 marks. Priya scored 15 more than Maya. Riya scored 12 fewer than Priya. Kavya scored 18 more than Riya. How many marks did Kavya score?', type: 'Compare', hint: 'Trace the relative mark comparisons across Maya, Priya, Riya, and Kavya step-by-step. Are you calculating relative score differences between individuals?' },
    { id: 'l4_q11', text: 'A blue ribbon is 140 cm long. A yellow ribbon is 25 cm shorter. A green ribbon is 30 cm longer than the yellow ribbon. A red ribbon is 15 cm shorter than the green ribbon. How long is the red ribbon?', type: 'Compare', hint: 'Follow the length relationships among the blue, yellow, green, and red ribbons. Are you measuring comparative differences across multiple items?' },
    { id: 'l4_q12', text: 'A company employs 850 workers. Another company employs 120 more workers. A third company employs 95 fewer than the second company. A fourth company employs 60 more than the third company. How many workers does the fourth company employ?', type: 'Compare', hint: 'Trace the relative employee headcounts across all four companies. Are you evaluating comparative differences between companies?' }
  ],
  5: [
    { id: 'l5_q1', text: 'A bicycle costs ₹6,500. A scooter costs ₹4,200 more than the bicycle. What is the total cost of buying both?', type: 'Compare+Combine', hint: 'Think about the two steps involved: first determine the scooter\'s cost relative to the bicycle, then calculate the total cost for both items together.' },
    { id: 'l5_q2', text: 'A laptop costs ₹48,000. A printer costs ₹36,000 less than the laptop. What is the total price of the laptop and printer?', type: 'Compare+Combine', hint: 'Break down the sequence: first find the printer\'s price relative to the laptop, then combine both prices for the grand total.' },
    { id: 'l5_q3', text: 'A notebook costs ₹85. A pen costs ₹30 less than the notebook. If Rahul buys 3 notebooks and 4 pens, how much does he spend altogether?', type: 'Compare+Combine', hint: 'First evaluate the pen\'s price relative to the notebook, then calculate the combined expenditure for buying multiple items.' },
    { id: 'l5_q4', text: 'A football costs ₹950. A cricket bat costs ₹450 more than the football. What is the total cost of both items?', type: 'Compare+Combine', hint: 'Determine the cricket bat\'s price relative to the football first, then combine the prices of both sports items.' },
    { id: 'l5_q5', text: 'A dining table costs ₹12,500. A chair costs ₹10,200 less than the table. If you buy one table and four chairs, what is the total cost?', type: 'Compare+Combine', hint: 'First find the individual chair\'s cost relative to the dining table, then calculate the combined cost of the table plus multiple chairs.' },
    { id: 'l5_q6', text: 'A school bag costs ₹1,450. A lunch box costs ₹950 less than the bag. If a student buys one bag and two lunch boxes, what is the total cost?', type: 'Compare+Combine', hint: 'Break down the steps: first find the lunch box\'s cost relative to the bag, then total the expenditure for buying a bag and lunch boxes.' },
    { id: 'l5_q7', text: 'A mobile phone costs ₹18,000. Wireless earbuds cost ₹15,200 less than the phone. What is the total price of both?', type: 'Compare+Combine', hint: 'First determine the earbuds\' price relative to the phone, then combine both item prices for the final total.' },
    { id: 'l5_q8', text: 'Neha had ₹850. She spent ₹240 on books. She now has ₹110 less than her sister. How much money does her sister have?', type: 'Change+Compare', hint: 'Identify the two stages: first update Neha\'s money after her purchase, then analyze how her new balance compares to her sister\'s.' },
    { id: 'l5_q9', text: 'Rohan had 145 cricket cards. He gave 38 cards to his cousin. He now has 25 fewer cards than Aman. How many cards does Aman have?', type: 'Change+Compare', hint: 'First adjust Rohan\'s card count after giving some away, then analyze how his updated total compares to Aman\'s.' },
    { id: 'l5_q10', text: 'A water tank had 950 liters. After using 275 liters, it contains 120 liters less than another tank. How much water is in the other tank?', type: 'Change+Compare', hint: 'First update the water volume after usage, then analyze how the remaining volume compares to the second tank.' },
    { id: 'l5_q11', text: 'A shopkeeper had 620 chocolates. He sold 185 chocolates. He now has 90 fewer chocolates than another shopkeeper. How many chocolates does the other shopkeeper have?', type: 'Change+Compare', hint: 'First adjust the shopkeeper\'s chocolate stock after sales, then evaluate how his remaining stock compares to the second shopkeeper\'s.' },
    { id: 'l5_q12', text: 'Ananya had 210 stickers. She bought 45 more stickers. She now has 35 more stickers than Riya. How many stickers does Riya have?', type: 'Change+Compare', hint: 'First update Ananya\'s sticker count after buying more, then analyze how her new total compares to Riya\'s.' }
  ],
  6: [
    { id: 'l6_q1', text: 'Aarav has ₹850 and Kabir has ₹720. Aarav spends ₹210 on a bicycle. Kabir earns ₹180 from tutoring. Who has more money now and by how much?', type: 'Change+Compare', hint: 'Track the money changes for Aarav and Kabir separately, then analyze how their resulting final balances compare.' },
    { id: 'l6_q2', text: 'Rohan starts with ₹950 and Arjun starts with ₹780. Rohan spends ₹250 on a phone and later earns ₹120. Arjun earns ₹200 from freelancing and spends ₹140 on books. Who has more money now and by how much?', type: 'Change+Compare', hint: 'Follow the income and spending transactions for Rohan and Arjun independently, then compare their updated balances.' },
    { id: 'l6_q3', text: 'Neha has ₹640 and Priya has ₹590. Neha receives ₹180 as a gift and spends ₹95. Priya spends ₹130 and later earns ₹210. Who has more money now and by how much?', type: 'Change+Compare', hint: 'Calculate the financial gains and losses for Neha and Priya separately, then compare their final amounts.' },
    { id: 'l6_q4', text: 'Library A has 420 books and Library B has 390 books. Library A donates 65 books and receives 110 new books. Library B receives 140 books and donates 50 books. Which library has more books now and by how many?', type: 'Change+Compare', hint: 'Track the book donations and acquisitions for Library A and Library B independently, then compare their resulting inventories.' },
    { id: 'l6_q5', text: 'School A has 680 students and School B has 645 students. School A admits 55 new students and 40 students transfer out. School B admits 80 new students and 35 students transfer out. Which school has more students now and by how many?', type: 'Change+Compare', hint: 'Calculate student enrollments and transfers for School A and School B separately, then evaluate how their updated totals compare.' },
    { id: 'l6_q6', text: 'Factory A produced 1,250 units while Factory B produced 1,180 units. Factory A shipped 320 units and produced another 140 units. Factory B produced 210 more units and shipped 260 units. Which factory has more units now and by how many?', type: 'Change+Compare', hint: 'Track the manufacturing additions and shipments for Factory A and Factory B independently, then compare their final unit counts.' },
    { id: 'l6_q7', text: 'Warehouse A stores 920 boxes while Warehouse B stores 870 boxes. Warehouse A ships 210 boxes and receives 140 new boxes. Warehouse B receives 190 new boxes and ships 120 boxes. Which warehouse has more boxes now?', type: 'Change+Compare', hint: 'Follow the shipment and arrival changes for Warehouse A and Warehouse B separately, then compare their final box stocks.' },
    { id: 'l6_q8', text: 'A cricket team scored 265 runs while another scored 240 runs. The first team received a 25-run penalty while the second team earned 18 bonus runs. Which team has the higher score now and by how much?', type: 'Change+Compare', hint: 'Calculate the score adjustments (penalties and bonuses) for both cricket teams, then compare their final team scores.' },
    { id: 'l6_q9', text: 'Class A has 36 boys and 32 girls. Class B has 34 boys and 38 girls. Class A gains 6 students and loses 3 students. Class B gains 10 students and loses 4 students. Which class has more students now?', type: 'Combine+Change+Compare', hint: 'First combine the boys and girls in each class, apply the student gains/losses over time to both classes, then compare their final totals.' },
    { id: 'l6_q10', text: 'School X has 420 boys and 390 girls. School Y has 405 boys and 415 girls. School X admits 28 students and 15 transfer out. School Y admits 35 students and 20 transfer out. Which school has more students now?', type: 'Combine+Change+Compare', hint: 'First total the boys and girls for School X and School Y, apply the admissions and transfers to both schools, then compare their final enrollments.' },
    { id: 'l6_q11', text: 'Library A contains 280 novels and 190 science books. Library B contains 260 novels and 225 science books. Library A receives 35 books and donates 20 books. Library B receives 30 books and donates 18 books. Which library has more books?', type: 'Combine+Change+Compare', hint: 'First combine the novel and science book categories for each library, apply the receipts and donations, then compare their final book totals.' },
    { id: 'l6_q12', text: 'Team Red has 22 forwards and 18 defenders. Team Blue has 20 forwards and 23 defenders. Team Red signs 4 new players and releases 2 players. Team Blue signs 6 new players and releases 5 players. Which team has more players now?', type: 'Combine+Change+Compare', hint: 'First total the forwards and defenders for Team Red and Team Blue, apply player signings and releases, then compare their final roster sizes.' }
  ],
  7: [
    { id: 'l7_q1', text: 'Rohan has ₹900 and Meera has ₹750. Rohan spends 20% of his money and later earns ₹180 from tutoring. Meera spends 15% of her money and later earns ₹120. Who has more money now and by how much?', type: 'Change+Compare', hint: 'First apply percentage changes and income additions to Rohan and Meera\'s amounts separately, then compare their final balances.' },
    { id: 'l7_q2', text: 'Factory A produces 800 units per day and Factory B produces 720 units per day. Factory A increases production by 15%, while Factory B increases production by 22%. Which factory produces more now and by how many units?', type: 'Change+Compare', hint: 'Calculate the percentage production increases for Factory A (+15%) and Factory B (+22%) independently, then compare their new daily outputs.' },
    { id: 'l7_q3', text: 'School A has 1,200 students and School B has 980 students. School A\'s enrollment increases by 10%, while School B\'s increases by 18%. Which school has more students now and by how many?', type: 'Change+Compare', hint: 'Determine the student growth for School A (+10%) and School B (+18%) using their respective percentage increases, then compare their updated enrollments.' },
    { id: 'l7_q4', text: 'Arjun scored 84 marks and Neha scored 76 marks. Arjun improves his score by 20% in the retest, while Neha improves hers by 25%. Who scores higher now and by how many marks?', type: 'Change+Compare', hint: 'Calculate Arjun and Neha\'s retest scores after applying their respective percentage improvements, then compare their new scores.' },
    { id: 'l7_q5', text: 'Warehouse A has 1,500 boxes and Warehouse B has 1,250 boxes. Warehouse A ships 30% of its boxes and later receives 220 new boxes. Warehouse B ships 25% of its boxes and later receives 260 new boxes. Which warehouse has more boxes now?', type: 'Change+Compare', hint: 'Account for percentage shipments and box additions for Warehouse A and Warehouse B separately, then compare their remaining inventories.' },
    { id: 'l7_q6', text: 'Riya earns ₹60,000 per month and Simran earns ₹52,000 per month. Both receive a 12% salary raise. Riya spends 25% of her new salary while Simran spends 20% of hers. Who has more money left and by how much?', type: 'Change+Compare', hint: 'Calculate the salary raises and spending percentages for Riya and Simran independently, then compare their net remaining funds.' },
    { id: 'l7_q7', text: 'Company A has 450 employees and Company B has 390 employees. Company A hires 18% more employees and then 10% of its new total resign. Company B hires 22% more employees and then 8% resign. Which company has more employees now?', type: 'Change+Compare', hint: 'Apply hiring and resignation percentages to both Company A and Company B headcounts, then compare their final employee totals.' },
    { id: 'l7_q8', text: 'Town A has 15,000 people and Town B has 12,800 people. Town A grows by 8% and then loses 3% of its new population. Town B grows by 12% and then loses 4%. Which town has more people after these changes?', type: 'Change+Compare', hint: 'Track multi-phase percentage population growth and loss for Town A and Town B independently, then compare their final populations.' },
    { id: 'l7_q9', text: 'A cricket academy has 240 boys and 180 girls. Another academy has 220 boys and 210 girls. The first academy increases both groups by 10%. The second academy increases boys by 15% and girls by 12%. Which academy has more students now?', type: 'Combine+Change+Compare', hint: 'First combine boys and girls for each cricket academy, apply the percentage growth rates to each group, then compare their final total memberships.' },
    { id: 'l7_q10', text: 'School X has 520 boys and 480 girls. School Y has 500 boys and 510 girls. School X admits 8% more students, while School Y admits 10% more students. Which school has more students after admission?', type: 'Combine+Change+Compare', hint: 'First total the boys and girls for School X and School Y, apply the percentage enrollment increases to both schools, then compare their updated student bodies.' },
    { id: 'l7_q11', text: 'Library A has 600 fiction books and 350 science books. Library B has 540 fiction books and 420 science books. Library A purchases 15% more books. Library B purchases 12% more books. Which library has more books now?', type: 'Combine+Change+Compare', hint: 'First combine fiction and science book categories for both libraries, apply their percentage book acquisitions, then compare their new library totals.' },
    { id: 'l7_q12', text: 'Factory A employs 320 men and 180 women. Factory B employs 290 men and 220 women. Factory A hires 10% more staff. Factory B hires 12% more staff. Which factory has more employees after hiring?', type: 'Combine+Change+Compare', hint: 'First total male and female employees for Factory A and Factory B, apply the percentage staff hirings, then compare their final staff totals.' }
  ]
};

function loadProgress() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {}
  return { unlockedLevel: 0, completedLevels: [] };
}

function saveProgress(progress) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch (e) {}
}

function getLevelFromPath() {
  const match = window.location.pathname.match(/\/vachana\/schema\/level-(\d+)/);
  if (match) {
    const lvl = parseInt(match[1], 10);
    if (lvl >= 0 && lvl <= 7) return lvl;
  }
  return null; // Landing / overview page
}

function getSchemaColorInfo(opt) {
  const baseInfo = { defaultBg: 'var(--clr-card)', defaultBorder: 'var(--clr-border)', selectedBg: 'var(--clr-surface)', glow: '0 4px 16px rgba(232, 134, 74, 0.2)' };
  return { ...baseInfo, mainColor: 'var(--clr-accent, #F97316)' };
}

const SCHEMA_DESCRIPTIONS = {
  'Combine': 'Two quantities are joined to form a whole.',
  'Compare': 'Two quantities are related by a difference.',
  'Change': 'A quantity increases or decreases over time.',
  'Compare+Combine': 'First compare two amounts, then combine totals.',
  'Change+Compare': 'First track a change, then compare to another quantity.',
  'Compare+Change': 'First compare quantities, then apply a change.',
  'Combine+Change+Compare': 'Combine subsets, apply a change, then compare results.',
  'Compare+Combine+Change': 'Compare amounts, combine totals, then track a change.'
};

const SCHEMA_ICONS = {
  'Combine': '+',
  'Compare': '⇄',
  'Change': '✏️',
  'Compare+Combine': '+⇄',
  'Change+Compare': '✏️⇄',
  'Compare+Change': '⇄✏️',
  'Combine+Change+Compare': '+✏️⇄',
  'Compare+Combine+Change': '⇄+✏️'
};

export default function SchemaClassifier() {
  const [progress, setProgress] = useState(loadProgress);
  const [activeLevel, setActiveLevel] = useState(getLevelFromPath);
  const [answers, setAnswers] = useState({});
  const [optionsByQuestion, setOptionsByQuestion] = useState({});

  // Initialize fixed options array per question when level changes
  useEffect(() => {
    if (activeLevel && activeLevel >= 1 && activeLevel <= 7) {
      const questions = QUESTIONS_BY_LEVEL[activeLevel] || [];
      const optionMap = {};
      questions.forEach(q => {
        optionMap[q.id] = generateOptionsForQuestion(q, activeLevel);
      });
      setOptionsByQuestion(optionMap);
    } else {
      setOptionsByQuestion({});
    }
  }, [activeLevel]);
  const [msg, setMsg] = useState('');
  const [levelPassed, setLevelPassed] = useState(false);
  const [questionAttempts, setQuestionAttempts] = useState({});
  const [hasVerified, setHasVerified] = useState(false);
  const [verifiedQuestions, setVerifiedQuestions] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quickCheckChoice, setQuickCheckChoice] = useState(null);
  const [quickCheckFeedback, setQuickCheckFeedback] = useState(null);
  const [l0Answers, setL0Answers] = useState({ q1: null, q2: null, q3: null });
  const [l0Feedback, setL0Feedback] = useState({ q1: null, q2: null, q3: null });
  const [l0ActiveIndex, setL0ActiveIndex] = useState(0);
  const [l0ActiveStep, setL0ActiveStep] = useState(1);
  const [l0Transitioning, setL0Transitioning] = useState(false);

  // Level 0 Interactive Steps State
  const [l0CombineItems, setL0CombineItems] = useState([
    { id: 'item-1', group: 'A', emoji: '🧸' },
    { id: 'item-2', group: 'A', emoji: '🧸' },
    { id: 'item-3', group: 'B', emoji: '🪀' },
    { id: 'item-4', group: 'B', emoji: '🪀' }
  ]);
  const [l0CombineDropZone, setL0CombineDropZone] = useState([]);
  const [l0CombineCompleted, setL0CombineCompleted] = useState(false);

  const [l0CompareChoice, setL0CompareChoice] = useState(null); // 'A', 'B', 'equal'
  const [l0CompareDiffInput, setL0CompareDiffInput] = useState('');
  const [l0CompareCompleted, setL0CompareCompleted] = useState(false);

  const [l0ChangeState, setL0ChangeState] = useState(6); // Initial candies count
  const [l0ChangeDiff, setL0ChangeDiff] = useState(0);
  const [l0ChangeHistory, setL0ChangeHistory] = useState([]);
  const [l0ChangeCompleted, setL0ChangeCompleted] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);
  const [streak, setStreak] = useState(0);



  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewQIndex, setReviewQIndex] = useState(0);

  const resetLevelState = () => {
    setAnswers({});
    setMsg('');
    setLevelPassed(false);
    setIsReviewMode(false);
    setReviewQIndex(0);
    setQuestionAttempts({});
    setVerifiedQuestions({});
    setHasVerified(false);
    setCurrentQIndex(0);
    setIsFlipped(false);
    setQuickCheckChoice(null);
    setQuickCheckFeedback(null);
    setL0Answers({ q1: null, q2: null, q3: null });
    setL0Feedback({ q1: null, q2: null, q3: null });
    setL0ActiveIndex(0);
    setL0ActiveStep(1);
    setL0Transitioning(false);
    setL0CombineDropZone([]);
    setL0CombineCompleted(false);
    setL0CompareChoice(null);
    setL0CompareDiffInput('');
    setL0CompareCompleted(false);
    setL0ChangeState(6);
    setL0ChangeDiff(0);
    setL0ChangeHistory([]);
    setL0ChangeCompleted(false);
    setStreak(0);
  };

  const navigateToLevel = (lvl, replace = false) => {
    let target = lvl;
    if (target !== null && target !== 0 && target > progress.unlockedLevel && !progress.completedLevels.includes(target - 1)) {
      target = 0;
    }

    const path = target !== null ? `/vachana/schema/level-${target}` : '/vachana/schema';
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setActiveLevel(target);
    resetLevelState();
  };

  // Synchronize route & enforce level gating
  useEffect(() => {
    const handlePopState = () => {
      const targetLevel = getLevelFromPath();
      if (targetLevel !== null && targetLevel !== 0 && targetLevel > progress.unlockedLevel && !progress.completedLevels.includes(targetLevel - 1)) {
        navigateToLevel(0, true);
      } else {
        setActiveLevel(targetLevel);
        resetLevelState();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [progress]);

  // Enforce gating on mount or activeLevel change
  useEffect(() => {
    if (activeLevel !== null && activeLevel !== 0 && activeLevel > progress.unlockedLevel && !progress.completedLevels.includes(activeLevel - 1)) {
      navigateToLevel(0, true);
    }
  }, [activeLevel, progress]);

  const checkOverallLevelPass = (currentAnswers, currentVerified) => {
    if (!activeLevel) return;
    const questions = QUESTIONS_BY_LEVEL[activeLevel];
    if (!questions || questions.length === 0) return;

    const correctCount = questions.filter(q => isSchemaMatch(currentAnswers[q.id], q.type)).length;
    const allCorrect = correctCount === questions.length;

    console.log(`[SchemaClassifier] Level ${activeLevel} completion check: ${correctCount}/${questions.length} correct. allCorrect=${allCorrect}`);

    if (allCorrect) {
      setLevelPassed(true);
      setMsg(`🎉 Outstanding! You have correctly answered all ${questions.length} questions for Level ${activeLevel}!`);

      const allVerified = { ...currentVerified };
      questions.forEach(q => { allVerified[q.id] = true; });
      setVerifiedQuestions(allVerified);

      const currentProg = loadProgress();
      const nextUnlocked = Math.max(currentProg.unlockedLevel, Math.min(7, activeLevel + 1));
      const nextCompleted = Array.from(new Set([...currentProg.completedLevels, activeLevel]));

      const newProgress = {
        unlockedLevel: nextUnlocked,
        completedLevels: nextCompleted
      };

      console.log(`[SchemaClassifier] Unlocking next level:`, newProgress);
      setProgress(newProgress);
      saveProgress(newProgress);
    }
  };

  const handleVerifyQuestion = (qId) => {
    if (!activeLevel) return;
    const questions = QUESTIONS_BY_LEVEL[activeLevel];
    const prob = questions?.find(q => q.id === qId);
    if (!prob) return;

    const userChoice = answers[qId];
    if (!userChoice) {
      setMsg(`⚠️ Please select a schema classification for Question ${currentQIndex + 1} before verifying.`);
      return;
    }

    const isCorrect = isSchemaMatch(userChoice, prob.type);
    const updatedVerified = { ...verifiedQuestions, [qId]: true };
    setVerifiedQuestions(updatedVerified);

    if (!isCorrect) {
      const updatedAttempts = {
        ...questionAttempts,
        [qId]: (questionAttempts[qId] || 0) + 1
      };
      setQuestionAttempts(updatedAttempts);

      // RESET STREAK TO 0 IMMEDIATELY ON INCORRECT ANSWER (NO ANIMATION)
      setStreak(0);
    } else {
      const updatedAttempts = {
        ...questionAttempts,
        [qId]: 0
      };
      setQuestionAttempts(updatedAttempts);

      // INCREMENT STREAK BY 1 ON CORRECT ANSWER (NO ANIMATION)
      setStreak(prev => prev + 1);
    }
    setMsg('');

    checkOverallLevelPass(answers, updatedVerified);
  };

  const handleVerify = () => {
    if (!activeLevel) return;
    const questions = QUESTIONS_BY_LEVEL[activeLevel];
    if (!questions) return;

    const allAnswered = questions.every(q => answers[q.id]);
    if (!allAnswered) {
      setMsg(`⚠️ Please select a schema classification for all ${questions.length} questions before verifying.`);
      return;
    }

    setHasVerified(true);
    const updatedVerified = {};
    questions.forEach(q => { updatedVerified[q.id] = true; });
    setVerifiedQuestions(updatedVerified);

    checkOverallLevelPass(answers, updatedVerified);
  };

  const handleReset = () => {
    const resetProg = { unlockedLevel: 0, completedLevels: [] };
    setProgress(resetProg);
    saveProgress(resetProg);
    navigateToLevel(null);
  };

  if (activeLevel === null) {
    return (
      <div style={{
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--clr-bg)',
        color: 'var(--clr-text)',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.01em',
        padding: '32px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>

        <style>{`
          .schema-overview-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          @media (max-width: 1200px) {
            .schema-overview-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 18px;
            }
          }
          @media (max-width: 850px) {
            .schema-overview-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
          }
          @media (max-width: 550px) {
            .schema-overview-grid {
              grid-template-columns: 1fr;
              gap: 14px;
            }
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '20px' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: 'var(--clr-accent)', fontWeight: 700 }}>
              Word Problem Schema Classifier
            </h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--clr-text-soft)', lineHeight: '1.55', fontWeight: 400 }}>
              Master arithmetic schema identification through an introductory tutorial level and a 7-level gated progression system.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-card)',
            padding: '22px 30px',
            borderRadius: '12px',
            border: '1px solid var(--clr-border)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Progression
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', color: 'var(--clr-accent)', fontWeight: 700 }}>
                {progress.completedLevels.filter(l => l >= 1).length} of 7 Assessment Levels Completed
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            </div>
          </div>

          <div className="schema-overview-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(lvl => {
              const isUnlocked = lvl === 0 || progress.completedLevels.includes(lvl - 1) || lvl <= progress.unlockedLevel;
              const isCompleted = progress.completedLevels.includes(lvl);
              const meta = LEVEL_METADATA[lvl];

              return (
                <div
                  key={lvl}
                  onClick={() => isUnlocked && navigateToLevel(lvl)}
                  style={{
                    background: 'var(--clr-card)',
                    border: isCompleted ? '1px solid var(--clr-correct)' : isUnlocked ? '1px solid var(--clr-border)' : '1px solid var(--clr-border)',
                    borderLeft: isUnlocked ? '4px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                    opacity: isUnlocked ? 1 : 0.45,
                    borderRadius: '12px',
                    padding: '24px 28px',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '10px',
                    boxSizing: 'border-box',
                    boxShadow: 'var(--shadow-card)',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (isUnlocked) {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = isCompleted
                        ? '0 8px 24px rgba(34,197,94,0.25)'
                        : '0 8px 24px rgba(249,115,22,0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isUnlocked) {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    }
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isCompleted ? 'var(--clr-correct)' : isUnlocked ? 'var(--clr-accent)' : 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Level {lvl}</span>
                    {isCompleted && <span>✓</span>}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-text)', lineHeight: 1.35 }}>
                    {meta.title.split(': ')[1] || meta.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render Level 0 Tutorial Page (/vachana/schema/level-0)
  if (activeLevel === 0) {
    const l0Questions = [
      {
        id: 'q1',
        title: 'Question 1',
        icon: '🎁',
        text: '🎁 Meera has 3 🎁 gifts. Her friend gives her 2 more 🎁 gifts. Which schema is this?',
        correctType: 'Combine',
        hints: {
          Combine: 'Are two groups coming together? 🤔',
          Compare: 'Are we looking at two groups to see which has more or less? 🤔',
          Change: 'Did something happen that changed the amount? 🤔'
        }
      },
      {
        id: 'q2',
        title: 'Question 2',
        icon: '🧸',
        text: '🧸 Aarav has 6 🧸 toys. Riya has 4 🧸 toys. Who has more toys? Which schema is this?',
        correctType: 'Compare',
        hints: {
          Combine: 'Are two groups coming together? 🤔',
          Compare: 'Are we looking at two groups to see which has more or less? 🤔',
          Change: 'Did something happen that changed the amount? 🤔'
        }
      },
      {
        id: 'q3',
        title: 'Question 3',
        icon: '🎈',
        text: '🎈 Kabir has 5 🎈 balloons. 2 balloons pop 💥. How many balloons does he have now? Which schema is this?',
        correctType: 'Change',
        hints: {
          Combine: 'Are two groups coming together? 🤔',
          Compare: 'Are we looking at two groups to see which has more or less? 🤔',
          Change: 'Did something happen that changed the amount? 🤔'
        }
      }
    ];

    const handleL0Select = (qId, choice) => {
      const q = l0Questions.find(item => item.id === qId);
      const isCorrect = choice === q.correctType;

      const newAnswers = { ...l0Answers, [qId]: choice };
      setL0Answers(newAnswers);

      const hintMsg = isCorrect
        ? 'Correct!'
        : `Not quite — try again! ${q.hints[choice] || 'Think carefully about the schema definition.'}`;

      setL0Feedback(prev => ({
        ...prev,
        [qId]: { isCorrect, msg: hintMsg }
      }));

      // Auto-advance to next question ONLY on correct answer
      if (isCorrect) {
        setTimeout(() => {
          setL0ActiveIndex(prev => {
            const nextIdx = prev + 1;
            if (nextIdx >= l0Questions.length) {
              const currentProg = loadProgress();
              if (!currentProg.completedLevels.includes(0)) {
                const newProg = {
                  unlockedLevel: Math.max(currentProg.unlockedLevel, 1),
                  completedLevels: Array.from(new Set([...currentProg.completedLevels, 0]))
                };
                setProgress(newProg);
                saveProgress(newProg);
              }
            }
            return nextIdx;
          });
        }, 1200);
      }
    };

    const handleL0Retry = (qId) => {
      setL0Answers(prev => ({ ...prev, [qId]: null }));
      setL0Feedback(prev => ({ ...prev, [qId]: null }));
    };

    // Calculate current sequential step (1 to 5)
    // Step 1: Combine Card
    // Step 2: Compare Card
    // Step 3: Change Card
    // Step 4: Ready Interstitial (after 3 cards, before practice quiz)
    // Step 5: Practice Quiz / Completion Screen
    const currentStep = l0ActiveStep <= 3
      ? l0ActiveStep
      : (l0ActiveStep === 4 ? 4 : (l0ActiveIndex < l0Questions.length ? 4 : 5));

    const handleStepNext = () => {
      if (l0Transitioning) return;
      setL0Transitioning(true);
      setTimeout(() => {
        setL0ActiveStep(prev => prev + 1);
        setL0Transitioning(false);
      }, 250);
    };

    return (
      <div style={{
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--clr-bg)',
        color: 'var(--clr-text)',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.01em',
        padding: '32px 24px',
        boxSizing: 'border-box'
      }}>
        <style>{`
            0% {
              opacity: 0;
              transform: translateY(12px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes stepCardExit {
            0% {
              opacity: 1;
              transform: translateX(0);
            }
            100% {
              opacity: 0;
              transform: translateX(-24px);
            }
          }
          @keyframes confettiFall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(320px) rotate(360deg);
              opacity: 0;
            }
          }
          @keyframes celebrateBounce {
            0% {
              transform: scale(0.95) translateY(0);
            }
            100% {
              transform: scale(1.08) translateY(-6px);
            }
          }
          .l0-step-container {
            animation: stepCardEntrance 0.35s ease-out forwards;
          }
          .l0-step-exit {
            animation: stepCardExit 0.25s ease-in forwards;
          }
          .l0-btn-clean {
            transition: background-color 0.15s ease, border-color 0.15s ease;
          }
          .l0-btn-clean:hover {
            background-color: #ea580c !important;
          }
          .confetti-piece {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 2px;
            pointer-events: none;
            animation: confettiFall 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .l0-up-next-pill {
            background: #36241b !important;
            border: 1px solid #e8864a !important;
            color: #e8864a !important;
            font-weight: 700 !important;
          }
          [data-theme="light"] .l0-up-next-pill {
            background: #ffefe5 !important;
            border: 1px solid #fdba74 !important;
            color: #000000 !important;
            font-weight: 700 !important;
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1160px', margin: '0 auto' }}>
          {/* TOPBAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <button
              onClick={() => navigateToLevel(null)}
              style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text-soft)',
                padding: '9px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease'
              }}
            >
              ← Overview
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  background: 'var(--clr-accent-soft)',
                  border: '1px solid var(--clr-border)',
                  color: 'var(--clr-accent)',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                Step {currentStep} of 5
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1.5px solid var(--clr-accent)',
                color: 'var(--clr-accent)',
                padding: '7px 20px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700
              }}>
                Level 0 · Schema Introduction
              </div>
            </div>
          </div>

          {/* HEADER HERO */}
          <div style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: '12px',
            padding: '30px 34px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--clr-text)', letterSpacing: '-0.01em' }}>
              Learn the 3 simple schema structures below, then practice!
            </h1>
          </div>

          {/* STEP 1: COMBINE CARD */}
          {l0ActiveStep === 1 && (
            <div key="step-1" className={l0Transitioning ? 'l0-step-exit' : 'l0-step-container'} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderLeft: '4px solid var(--clr-accent)',
                borderRadius: '12px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div aria-live="polite" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                  {l0CombineCompleted ? 'Combine activity complete! 2 teddy bears plus 2 yo-yos equal 4 toys in the gift box.' : `${l0CombineDropZone.length} of 4 items moved to gift box.`}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                      1. COMBINE
                    </h3>
                    <button
                      onClick={() => {
                        setL0CombineDropZone([]);
                        setL0CombineCompleted(false);
                      }}
                      style={{
                        background: 'var(--clr-surface)',
                        border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text-soft)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      ↺ Reset
                    </button>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--clr-text-soft)', lineHeight: 1.5, fontWeight: 400 }}>
                    <strong style={{ color: 'var(--clr-text)' }}>Putting quantities together</strong> to form a whole total. Drag or tap all toys into the gift box!
                  </p>

                  <div style={{
                    background: 'var(--clr-surface)',
                    border: '1px dashed var(--clr-border)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                      width: '100%'
                    }}>
                      {/* Group A */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--clr-card)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--clr-border)',
                        minWidth: '100px'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>Group A</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {l0CombineItems.filter(item => item.group === 'A' && !l0CombineDropZone.find(d => d.id === item.id)).map(item => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
                              onClick={() => {
                                const newDrop = [...l0CombineDropZone, item];
                                setL0CombineDropZone(newDrop);
                                if (newDrop.length === 4) setL0CombineCompleted(true);
                              }}
                              style={{
                                fontSize: '28px',
                                cursor: 'grab',
                                userSelect: 'none',
                                transition: 'transform 0.15s ease',
                                padding: '4px'
                              }}
                              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              {item.emoji}
                            </div>
                          ))}
                          {l0CombineItems.filter(item => item.group === 'A' && !l0CombineDropZone.find(d => d.id === item.id)).length === 0 && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', italic: 'true' }}>Empty</span>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--clr-accent)' }}>+</span>

                      {/* Group B */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--clr-card)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--clr-border)',
                        minWidth: '100px'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>Group B</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {l0CombineItems.filter(item => item.group === 'B' && !l0CombineDropZone.find(d => d.id === item.id)).map(item => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
                              onClick={() => {
                                const newDrop = [...l0CombineDropZone, item];
                                setL0CombineDropZone(newDrop);
                                if (newDrop.length === 4) setL0CombineCompleted(true);
                              }}
                              style={{
                                fontSize: '28px',
                                cursor: 'grab',
                                userSelect: 'none',
                                transition: 'transform 0.15s ease',
                                padding: '4px'
                              }}
                              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              {item.emoji}
                            </div>
                          ))}
                          {l0CombineItems.filter(item => item.group === 'B' && !l0CombineDropZone.find(d => d.id === item.id)).length === 0 && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', italic: 'true' }}>Empty</span>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--clr-accent)' }}>=</span>

                      {/* Drop Zone */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const itemId = e.dataTransfer.getData('text/plain');
                          const item = l0CombineItems.find(i => i.id === itemId);
                          if (item && !l0CombineDropZone.find(d => d.id === item.id)) {
                            const newDrop = [...l0CombineDropZone, item];
                            setL0CombineDropZone(newDrop);
                            if (newDrop.length === 4) setL0CombineCompleted(true);
                          }
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          background: l0CombineCompleted ? 'var(--clr-correct-bg)' : 'var(--clr-card)',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          border: l0CombineCompleted ? '2px solid var(--clr-correct)' : '2px dashed var(--clr-accent)',
                          minWidth: '150px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: l0CombineCompleted ? 'var(--clr-correct)' : 'var(--clr-accent)', textTransform: 'uppercase' }}>🎁 Gift Box Drop Zone</span>
                        <div style={{ display: 'flex', gap: '6px', minHeight: '36px', alignItems: 'center' }}>
                          {l0CombineDropZone.map(item => (
                            <span key={item.id} style={{ fontSize: '26px', animation: 'stepCardEntrance 0.2s ease-out' }}>{item.emoji}</span>
                          ))}
                          {l0CombineDropZone.length === 0 && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Drop toys here</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ color: 'var(--clr-accent)', fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>
                      {pluralize(l0CombineDropZone.filter(i => i.group === 'A').length, 'bear')} + {pluralize(l0CombineDropZone.filter(i => i.group === 'B').length, 'yo-yo')} = {pluralize(l0CombineDropZone.length, 'total toy')}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: l0CombineCompleted ? 'var(--clr-correct-bg)' : 'var(--clr-accent-soft)',
                  border: l0CombineCompleted ? '1px solid var(--clr-correct)' : '1px solid var(--clr-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: l0CombineCompleted ? 'var(--clr-correct)' : 'var(--clr-text)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {l0CombineCompleted ? '🎉 Perfect! Things came together → COMBINE' : '👉 Drag or click toys into the gift box → COMBINE'}
                </div>
              </div>

              {/* NEXT BUTTON ROW WITH HIGHLIGHTED PILL TEASER */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginTop: '4px',
                flexWrap: 'wrap'
              }}>
                <div className="l0-up-next-pill" style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Up next: Compare — see who has more!</span>
                </div>

                <button
                  onClick={handleStepNext}
                  disabled={!l0CombineCompleted}
                  className="l0-btn-clean"
                  style={{
                    padding: '14px 28px',
                    background: l0CombineCompleted ? 'var(--clr-accent)' : 'var(--clr-surface)',
                    color: l0CombineCompleted ? '#ffffff' : 'var(--clr-text-soft)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '8px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: l0CombineCompleted ? 'pointer' : 'not-allowed',
                    opacity: l0CombineCompleted ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COMPARE CARD */}
          {l0ActiveStep === 2 && (
            <div key="step-2" className={l0Transitioning ? 'l0-step-exit' : 'l0-step-container'} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderLeft: '4px solid var(--clr-accent)',
                borderRadius: '12px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div aria-live="polite" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                  {l0CompareCompleted ? 'Compare activity complete! Group A has 2 more puzzles than Group B.' : `Selected choice: ${l0CompareChoice || 'None'}.`}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                      2. COMPARE
                    </h3>
                    <button
                      onClick={() => {
                        setL0CompareChoice(null);
                        setL0CompareDiffInput('');
                        setL0CompareCompleted(false);
                      }}
                      style={{
                        background: 'var(--clr-surface)',
                        border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text-soft)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      ↺ Reset
                    </button>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--clr-text-soft)', lineHeight: 1.5, fontWeight: 400 }}>
                    <strong style={{ color: 'var(--clr-text)' }}>Comparing two quantities</strong> to see which group has more!
                  </p>

                  <div style={{
                    background: 'var(--clr-surface)',
                    border: '1px dashed var(--clr-border)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                      {/* Group A (5 items) */}
                      <div
                        onClick={() => {
                          setL0CompareChoice('A');
                          setL0CompareCompleted(true);
                        }}
                        style={{
                          background: l0CompareChoice === 'A' ? 'var(--clr-accent-soft)' : 'var(--clr-card)',
                          border: l0CompareChoice === 'A' ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          flex: '1',
                          minWidth: '160px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>GROUP A (5 Puzzles)</span>
                        <div style={{ fontSize: '24px' }}>🧩🧩🧩🧩🧩</div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: l0CompareChoice === 'A' ? 'var(--clr-accent)' : 'var(--clr-text-soft)' }}>
                          {l0CompareChoice === 'A' ? '✓ Selected (Has More)' : 'Tap to Select'}
                        </span>
                      </div>

                      {/* Group B (3 items) */}
                      <div
                        onClick={() => {
                          setL0CompareChoice('B');
                          setL0CompareCompleted(false);
                        }}
                        style={{
                          background: l0CompareChoice === 'B' ? 'var(--clr-accent-soft)' : 'var(--clr-card)',
                          border: l0CompareChoice === 'B' ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          flex: '1',
                          minWidth: '160px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>GROUP B (3 Puzzles)</span>
                        <div style={{ fontSize: '24px' }}>🧩🧩🧩</div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: l0CompareChoice === 'B' ? 'var(--clr-accent)' : 'var(--clr-text-soft)' }}>
                          {l0CompareChoice === 'B' ? 'Selected' : 'Tap to Select'}
                        </span>
                      </div>
                    </div>

                    <div style={{ color: 'var(--clr-accent)', fontWeight: 700, fontSize: '1.05rem' }}>
                      {l0CompareChoice === 'A' ? '5 vs 3 = 2 more puzzles in Group A!' : l0CompareChoice === 'B' ? 'Group B has 3 puzzles (Group A has 5 puzzles)' : '5 vs 3 = 2 more puzzles'}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: l0CompareCompleted ? 'var(--clr-correct-bg)' : 'var(--clr-accent-soft)',
                  border: l0CompareCompleted ? '1px solid var(--clr-correct)' : '1px solid var(--clr-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: l0CompareCompleted ? 'var(--clr-correct)' : 'var(--clr-text)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {l0CompareCompleted ? '🎉 Spot on! Comparing to see the difference → COMPARE' : '👉 Select the group with more puzzles → COMPARE'}
                </div>
              </div>

              {/* NEXT BUTTON ROW WITH HIGHLIGHTED PILL TEASER */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginTop: '4px',
                flexWrap: 'wrap'
              }}>
                <div className="l0-up-next-pill" style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Up next: Change — see quantities increase & decrease over time!</span>
                </div>

                <button
                  onClick={handleStepNext}
                  disabled={!l0CompareCompleted}
                  className="l0-btn-clean"
                  style={{
                    padding: '14px 28px',
                    background: l0CompareCompleted ? 'var(--clr-accent)' : 'var(--clr-surface)',
                    color: l0CompareCompleted ? '#ffffff' : 'var(--clr-text-soft)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '8px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: l0CompareCompleted ? 'pointer' : 'not-allowed',
                    opacity: l0CompareCompleted ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHANGE CARD */}
          {l0ActiveStep === 3 && (
            <div key="step-3" className={l0Transitioning ? 'l0-step-exit' : 'l0-step-container'} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderLeft: '4px solid var(--clr-accent)',
                borderRadius: '12px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div aria-live="polite" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                  {l0ChangeCompleted ? `Change activity complete! Started with 6 balloons, changed over time, now remaining ${l0ChangeState}.` : `Current ${l0ChangeState === 1 ? 'balloon' : 'balloons'}: ${l0ChangeState}.`}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                      3. CHANGE
                    </h3>
                    <button
                      onClick={() => {
                        setL0ChangeState(6);
                        setL0ChangeDiff(0);
                        setL0ChangeHistory([]);
                        setL0ChangeCompleted(false);
                      }}
                      style={{
                        background: 'var(--clr-surface)',
                        border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text-soft)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      ↺ Reset
                    </button>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--clr-text-soft)', lineHeight: 1.5, fontWeight: 400 }}>
                    <strong style={{ color: 'var(--clr-text)' }}>A quantity increases or decreases</strong> when events happen over time. Trigger events below to watch quantity change!
                  </p>

                  <div style={{
                    background: 'var(--clr-surface)',
                    border: '1px dashed var(--clr-border)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    {/* Visual Balloons Display */}
                    <div style={{ display: 'flex', gap: '8px', minHeight: '44px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {Array.from({ length: l0ChangeState }).map((_, idx) => (
                        <span key={idx} style={{ fontSize: '32px', transition: 'all 0.2s ease', animation: 'stepCardEntrance 0.25s ease-out' }}>🎈</span>
                      ))}
                      {l0ChangeState === 0 && (
                        <span style={{ fontSize: '1rem', color: 'var(--clr-text-soft)' }}>No balloons remaining!</span>
                      )}
                    </div>

                    {/* Interactive Event Action Buttons */}
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          if (l0ChangeState > 0) {
                            const newState = l0ChangeState - 2;
                            setL0ChangeState(newState);
                            setL0ChangeDiff(prev => prev - 2);
                            setL0ChangeHistory(prev => [...prev, '-2 Popped']);
                            setL0ChangeCompleted(true);
                          }
                        }}
                        disabled={l0ChangeState < 2}
                        style={{
                          background: 'var(--clr-card)',
                          border: '1px solid var(--clr-border)',
                          color: 'var(--clr-wrong)',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          cursor: l0ChangeState >= 2 ? 'pointer' : 'not-allowed',
                          opacity: l0ChangeState >= 2 ? 1 : 0.5
                        }}
                      >
                        💥 Pop 2 Balloons (-2)
                      </button>

                      <button
                        onClick={() => {
                          const newState = l0ChangeState + 3;
                          setL0ChangeState(newState);
                          setL0ChangeDiff(prev => prev + 3);
                          setL0ChangeHistory(prev => [...prev, '+3 Bought']);
                          setL0ChangeCompleted(true);
                        }}
                        style={{
                          background: 'var(--clr-card)',
                          border: '1px solid var(--clr-border)',
                          color: 'var(--clr-correct)',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        🎈 Buy 3 Balloons (+3)
                      </button>
                    </div>

                    <div style={{ color: 'var(--clr-accent)', fontWeight: 700, fontSize: '1.05rem' }}>
                      Start: 6 balloons → Events: {l0ChangeHistory.length > 0 ? l0ChangeHistory.join(', ') : 'None'} → Current: {pluralize(l0ChangeState, 'balloon')}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: l0ChangeCompleted ? 'var(--clr-correct-bg)' : 'var(--clr-accent-soft)',
                  border: l0ChangeCompleted ? '1px solid var(--clr-correct)' : '1px solid var(--clr-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: l0ChangeCompleted ? 'var(--clr-correct)' : 'var(--clr-text)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {l0ChangeCompleted ? '🎉 Awesome! Quantity changes over time → CHANGE' : '👉 Trigger an event button to change the balloon count → CHANGE'}
                </div>
              </div>

              {/* NEXT BUTTON ROW WITH HIGHLIGHTED PILL TEASER */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginTop: '4px',
                flexWrap: 'wrap'
              }}>
                <div className="l0-up-next-pill" style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Up next: Time to practice what you learned!</span>
                </div>

                <button
                  onClick={handleStepNext}
                  disabled={!l0ChangeCompleted}
                  className="l0-btn-clean"
                  style={{
                    padding: '14px 28px',
                    background: l0ChangeCompleted ? 'var(--clr-accent)' : 'var(--clr-surface)',
                    color: l0ChangeCompleted ? '#ffffff' : 'var(--clr-text-soft)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '8px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: l0ChangeCompleted ? 'pointer' : 'not-allowed',
                    opacity: l0ChangeCompleted ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INTERSTITIAL "READY?" SCREEN */}
          {l0ActiveStep === 4 && (
            <div key="step-interstitial" className={l0Transitioning ? 'l0-step-exit' : 'l0-step-container'}>
              <div style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderLeft: '4px solid var(--clr-accent)',
                borderRadius: '12px',
                padding: '40px 32px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '48px', lineHeight: 1 }}>
                  🏆
                </div>

                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                  You've learned all 3 patterns!
                </h2>

                <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--clr-text-soft)', lineHeight: 1.5, maxWidth: '480px' }}>
                  Let's see if you can spot them 👀
                </p>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  background: 'var(--clr-surface)',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--clr-border)'
                }}>
                  <span style={{ color: 'var(--clr-text)', fontWeight: 700 }}>Combine</span>
                  <span style={{ color: 'var(--clr-border)' }}>•</span>
                  <span style={{ color: 'var(--clr-text)', fontWeight: 700 }}>Compare</span>
                  <span style={{ color: 'var(--clr-border)' }}>•</span>
                  <span style={{ color: 'var(--clr-text)', fontWeight: 700 }}>Change</span>
                </div>

                {/* HIGHLIGHTED PILL TEASER FOR LEVEL 1 */}
                <div className="l0-up-next-pill" style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  <span>Up next: Level 1 begins!</span>
                </div>

                <button
                  onClick={handleStepNext}
                  className="l0-btn-clean"
                  style={{
                    padding: '16px 42px',
                    background: 'var(--clr-accent)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Let's Go!
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PRACTICE SECTION & COMPLETION SCREEN */}
          {l0ActiveStep === 5 && (
            <div key="step-practice" className="l0-step-container">
              <div style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderLeft: '4px solid var(--clr-accent)',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{
                    background: 'var(--clr-accent)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    PRACTICE TIME
                  </span>
                </div>

                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                  Now Let's Try!
                </h2>

                <p style={{ margin: '0 0 24px 0', fontSize: '1.05rem', color: 'var(--clr-text-soft)', lineHeight: 1.5, fontWeight: 400 }}>
                  You have learned all three. Great job! Now identify the schema in each question.
                </p>

                {/* ONE-QUESTION-AT-A-TIME PRACTICE WORKSPACE */}
                {l0ActiveIndex < l0Questions.length ? (
                  (() => {
                    const q = l0Questions[l0ActiveIndex];
                    const selected = l0Answers[q.id];
                    const feedback = l0Feedback[q.id];

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Progress Indicator Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--clr-surface)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Question {l0ActiveIndex + 1} of {l0Questions.length}
                          </span>
                          {/* 3 Progress Dots */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {l0Questions.map((_, idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: idx === l0ActiveIndex ? '24px' : '10px',
                                  height: '6px',
                                  borderRadius: '9999px',
                                  background: idx < l0ActiveIndex
                                    ? 'var(--clr-correct)'
                                    : idx === l0ActiveIndex
                                      ? 'var(--clr-accent)'
                                      : 'var(--clr-border)'
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Single Question Card */}
                        <div style={{
                          background: 'var(--clr-surface)',
                          border: '1px solid var(--clr-border)',
                          borderRadius: '12px',
                          padding: '28px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px'
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-text)', lineHeight: 1.6 }}>
                            {q.text}
                          </div>

                          {/* 3 Schema Option Buttons */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                            {['Combine', 'Compare', 'Change'].map((opt) => {
                              const isSelected = selected === opt;
                              const colorInfo = getSchemaColorInfo(opt);
                              const isOptCorrect = isSelected && feedback?.isCorrect;
                              const isOptWrong = isSelected && feedback && !feedback.isCorrect;

                              return (
                                <button
                                  key={opt}
                                  disabled={isSelected || (feedback && feedback.isCorrect)}
                                  onClick={() => handleL0Select(q.id, opt)}
                                  style={{
                                    height: '54px',
                                    borderRadius: '8px',
                                    padding: '0 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: (isSelected || (feedback && feedback.isCorrect)) ? 'default' : 'pointer',
                                    fontSize: '1.05rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    transition: 'all 0.18s ease',
                                    background: isOptCorrect
                                      ? 'rgba(34,197,94,0.18)'
                                      : isOptWrong
                                        ? 'rgba(239,68,68,0.18)'
                                        : isSelected
                                          ? colorInfo.selectedBg
                                          : 'var(--clr-card)',
                                    border: isOptCorrect
                                      ? '2px solid var(--clr-correct)'
                                      : isOptWrong
                                        ? '2px solid var(--clr-wrong)'
                                        : isSelected
                                          ? `2px solid ${colorInfo.mainColor}`
                                          : '1px solid var(--clr-border)',
                                    color: isOptCorrect
                                      ? 'var(--clr-correct)'
                                      : isOptWrong
                                        ? 'var(--clr-wrong)'
                                        : isSelected
                                          ? 'var(--clr-text)'
                                          : 'var(--clr-text-soft)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      background: colorInfo.mainColor
                                    }} />
                                    <span>{opt}</span>
                                  </div>
                                  {isSelected && (
                                    <span style={{ fontWeight: 700, fontSize: '16px' }}>
                                      {isOptCorrect ? '✓' : isOptWrong ? '✗' : '✓'}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Brief Feedback Banner & Retry Option */}
                          {feedback && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                padding: '12px 18px',
                                borderRadius: '8px',
                                background: feedback.isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                color: feedback.isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                                borderLeft: `4px solid ${feedback.isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span>{feedback.isCorrect ? '✅' : '❌'}</span>
                                <span>{feedback.msg}</span>
                              </div>

                              {!feedback.isCorrect && (
                                <button
                                  onClick={() => handleL0Retry(q.id)}
                                  className="l0-btn-clean"
                                  style={{
                                    alignSelf: 'flex-start',
                                    padding: '8px 18px',
                                    background: 'var(--clr-accent)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  🔄 Try Again
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* COMPLETION SCREEN (Shown after answering all questions) */
                  <div style={{
                    background: 'var(--clr-card)',
                    border: '1px solid var(--clr-correct)',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: 'var(--shadow-card)'
                  }}>
                    <div style={{ fontSize: '36px' }}>🎉</div>
                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                      Great job! You've completed practice.
                    </h3>
                    <p style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text-soft)' }}>
                      You know all three basic schemas! Level 1 is now unlocked. Ready to try real word problems?
                    </p>

                    <button
                      onClick={() => navigateToLevel(1)}
                      className="l0-btn-clean"
                      style={{
                        padding: '16px 36px',
                        background: 'var(--clr-accent)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      Start Level 1 →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Level Specific Workspace (/vachana/schema/level-X)
  const currentQuestions = QUESTIONS_BY_LEVEL[activeLevel] || [];
  const meta = LEVEL_METADATA[activeLevel] || { title: `Level ${activeLevel}`, desc: '' };
  const safeQIndex = Math.min(currentQIndex, Math.max(0, currentQuestions.length - 1));
  const prob = currentQuestions[safeQIndex] || { id: '', text: '', type: '' };

  const answeredCount = currentQuestions.filter(q => Boolean(answers[q.id])).length;
  const correctCount = currentQuestions.filter(q => verifiedQuestions[q.id] && isSchemaMatch(answers[q.id], q.type)).length;

  const isProbVerified = Boolean(prob.id && verifiedQuestions[prob.id]);
  const isProbCorrect = isProbVerified && isSchemaMatch(answers[prob.id], prob.type);
  const isProbWrong = isProbVerified && !isProbCorrect;
  const qAttempts = prob.id ? (questionAttempts[prob.id] || 0) : 0;

  // Schema Mastery calculations
  const totalCombine = currentQuestions.filter(q => q.type.includes('Combine')).length;
  const correctCombine = currentQuestions.filter(q => q.type.includes('Combine') && verifiedQuestions[q.id] && isSchemaMatch(answers[q.id], q.type)).length;
  const combinePercent = totalCombine > 0 ? Math.round((correctCombine / totalCombine) * 100) : 0;

  const totalCompare = currentQuestions.filter(q => q.type.includes('Compare')).length;
  const correctCompare = currentQuestions.filter(q => q.type.includes('Compare') && verifiedQuestions[q.id] && isSchemaMatch(answers[q.id], q.type)).length;
  const comparePercent = totalCompare > 0 ? Math.round((correctCompare / totalCompare) * 100) : 0;

  const totalChange = currentQuestions.filter(q => q.type.includes('Change')).length;
  const correctChange = currentQuestions.filter(q => q.type.includes('Change') && verifiedQuestions[q.id] && isSchemaMatch(answers[q.id], q.type)).length;
  const changePercent = totalChange > 0 ? Math.round((correctChange / totalChange) * 100) : 0;

  const overallAccuracy = currentQuestions.length > 0 ? Math.round((correctCount / currentQuestions.length) * 100) : 0;

  // Relevant schema options for SCHEMA SELECTION (stably shuffled per question)
  const availableSchemaOptions = (prob.id && optionsByQuestion[prob.id])
    ? optionsByQuestion[prob.id]
    : generateOptionsForQuestion(prob, activeLevel);

  const handleNextQuestionCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (safeQIndex < currentQuestions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      }
    }, 250);
  };

  const handleTryAgainCard = () => {
    setIsFlipped(false);
  };

  const handleVerifyOrAdvance = () => {
    if (!isFlipped) {
      if (!answers[prob.id]) return;
      handleVerifyQuestion(prob.id);
      setIsFlipped(true);
    } else {
      if (isProbCorrect) {
        handleNextQuestionCard();
      } else {
        handleTryAgainCard();
      }
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: 'var(--clr-bg)',
      color: 'var(--clr-text)',
      fontFamily: "'Inter', sans-serif",
      letterSpacing: '0.01em',
      padding: '24px',
      }}>

      <style>{`
        .schema-arena-layout {
          display: grid;
          grid-template-columns: minmax(0, 800px) auto;
          justify-content: center;
          gap: 24px;
          align-items: start;
        }
        .schema-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
          align-items: stretch;
        }
        @media (max-width: 1200px) {
          .schema-arena-layout {
            grid-template-columns: minmax(0, 700px) 230px;
            gap: 16px;
          }
        }
        @media (max-width: 950px) {
          .schema-arena-layout {
            grid-template-columns: 1fr;
          }
          .schema-progress-sidebar {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .schema-options-grid {
            grid-template-columns: 1fr;
          }
        }
        @keyframes hintSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0px;
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
            max-height: 200px;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .page-fade-enter {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1440px', margin: '0 auto' }}>
        {/* 1. TOP HEADER BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Left Branding + Overview button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigateToLevel(null)}
              style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text-soft)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--clr-accent)';
                e.currentTarget.style.color = 'var(--clr-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--clr-border)';
                e.currentTarget.style.color = 'var(--clr-text-soft)';
              }}
            >
              ← Overview
            </button>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--clr-text)', letterSpacing: '-0.01em' }}>
                Schema Arena
              </div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-soft)', fontWeight: 400 }}>
                Master the structure behind every problem
              </div>
            </div>
          </div>

          {/* Right Stat Pill Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* STREAK BADGE */}
            <div style={{
              background: streak > 0 ? 'var(--clr-accent)' : 'var(--clr-surface)',
              color: streak > 0 ? '#ffffff' : 'var(--clr-text-soft)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: streak > 0 ? 'none' : '1px solid var(--clr-border)',
              boxShadow: streak > 0 ? '0 2px 8px rgba(249,115,22,0.35)' : 'none',
              transition: 'background-color 0.15s ease'
            }}>
              <span>{streak > 0 ? '🔥' : '⚡'}</span> {streak} Streak
            </div>

            {/* ACCURACY BADGE */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.18)',
              color: '#22c55e',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              Accuracy: {overallAccuracy}%
            </div>

            {/* POINTS BADGE */}
            <div style={{
              background: 'var(--clr-surface)',
              color: '#eab308',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid var(--clr-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🪙</span> +{correctCount * 15} Points
            </div>

            {/* PROGRESS SIDEBAR TOGGLE BUTTON */}
            <button
              onClick={() => setShowSidebar(prev => !prev)}
              style={{
                background: showSidebar ? 'var(--clr-accent)' : 'var(--clr-surface)',
                border: showSidebar ? '1px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                color: showSidebar ? '#ffffff' : 'var(--clr-text-soft)',
                padding: '7px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                marginLeft: '6px'
              }}
              title="Toggle Progress & Mastery panel"
            >
              📊 {showSidebar ? 'Hide Stats' : 'Stats'}
            </button>
          </div>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="schema-arena-layout">
          {/* CENTER CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Badge Row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--clr-text-soft)',
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                padding: '4px 12px',
                borderRadius: '9999px'
              }}>
                {`LEVEL ${activeLevel} · ${meta.title.includes(': ') ? meta.title.split(': ')[1].toUpperCase() : meta.title.toUpperCase()}`}
              </div>
            </div>

            {/* 3D PERSPECTIVE FLIP QUESTION CARD */}
            <div style={{
              perspective: '1000px',
              width: '100%',
              minHeight: '210px',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                {/* QUESTION CARD FRONT SIDE */}
                <div style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background: 'var(--clr-card)',
                  border: '1px solid var(--clr-border)',
                  borderLeft: '4px solid var(--clr-accent)',
                  borderRadius: '12px',
                  padding: '32px 36px',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {/* Header Badge & Level */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--clr-accent)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 700
                    }}>
                      {safeQIndex + 1}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>
                      {activeLevel <= 2 ? 'BEGINNER' : activeLevel <= 4 ? 'INTERMEDIATE' : 'ADVANCED'} · QUESTION {safeQIndex + 1} / {currentQuestions.length}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div style={{
                    color: 'var(--clr-text)',
                    fontSize: '21px',
                    fontWeight: 500,
                    lineHeight: 1.6,
                    textAlign: 'center',
                    padding: '8px 4px'
                  }}>
                    "{prob.text}"
                  </div>

                  {/* Helper text */}
                  <div style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: 'var(--clr-text-soft)',
                    borderTop: '1px solid var(--clr-border)',
                    paddingTop: '14px'
                  }}>
                    Select the schema that best describes the <strong style={{ color: 'var(--clr-text)', fontWeight: 700 }}>relationship</strong> in the problem.
                  </div>
                </div>

                {/* QUESTION CARD BACK SIDE (Result View) */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: '12px',
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  boxShadow: 'var(--shadow-card)',
                  ...(isProbWrong
                    ? { background: 'var(--clr-card)', border: '1px solid var(--clr-wrong)', borderLeft: '4px solid var(--clr-wrong)' }
                    : { background: 'var(--clr-card)', border: '1px solid var(--clr-correct)', borderLeft: '4px solid var(--clr-correct)' })
                }}>
                  {isProbWrong ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>❌</span>
                        <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--clr-wrong)' }}>Not quite</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--clr-text-soft)', lineHeight: 1.5, maxWidth: '460px' }}>
                        This is a <strong style={{ color: 'var(--clr-text)', fontWeight: 700 }}>{prob.type}</strong> schema — {SCHEMA_DESCRIPTIONS[prob.type] || 'analyze the relationship in the problem.'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>✅</span>
                        <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--clr-correct)' }}>Correct!</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--clr-text-soft)', lineHeight: 1.5, maxWidth: '460px' }}>
                        This is a <strong style={{ color: 'var(--clr-text)', fontWeight: 700 }}>{prob.type}</strong> schema — {SCHEMA_DESCRIPTIONS[prob.type] || 'two quantities are joined to form a whole.'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#eab308' }}>
                        +15 Points earned
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* STATIC SCHEMA OPTION CARDS */}
            <div className="schema-options-grid" style={{ marginTop: '0px' }}>
              {availableSchemaOptions.map((opt, i) => {
                const isSelected = answers[prob.id] === opt;
                const colorInfo = getSchemaColorInfo(opt);
                const numLabel = `0${i + 1}`;
                const iconBadge = SCHEMA_ICONS[opt] || '+';
                const descText = SCHEMA_DESCRIPTIONS[opt] || 'Classify this problem schema.';

                return (
                  <div
                    key={opt}
                    onClick={() => {
                      if (isFlipped) return;
                      const updatedAnswers = { ...answers, [prob.id]: opt };
                      setAnswers(updatedAnswers);
                      setVerifiedQuestions(prev => ({ ...prev, [prob.id]: false }));
                      setMsg('');
                      setLevelPassed(false);
                      checkOverallLevelPass(updatedAnswers, verifiedQuestions);
                    }}
                    style={{
                      background: isSelected ? colorInfo.selectedBg : 'var(--clr-card)',
                      border: isSelected ? `2px solid var(--clr-accent)` : `1px solid var(--clr-border)`,
                      borderLeft: isSelected ? `4px solid var(--clr-accent)` : `1px solid var(--clr-border)`,
                      borderRadius: '12px',
                      padding: '18px 16px',
                      cursor: isFlipped ? 'default' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? colorInfo.glow : 'var(--shadow-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--clr-text-soft)', flexShrink: 0 }}>
                        {numLabel}
                      </span>
                      <div style={{
                        padding: '2px 6px',
                        minWidth: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: isSelected ? 'var(--clr-accent)' : 'var(--clr-surface)',
                        color: isSelected ? '#ffffff' : 'var(--clr-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0,
                        boxSizing: 'border-box'
                      }}>
                        {iconBadge}
                      </div>
                    </div>

                    <div style={{
                      fontSize: opt.length > 18 ? '13px' : opt.length > 10 ? '14px' : '17px',
                      fontWeight: 700,
                      color: 'var(--clr-text)',
                      wordBreak: 'normal',
                      overflowWrap: 'normal',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.3
                    }}>
                      {opt.replaceAll('+', '+ ')}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--clr-text-soft)', lineHeight: 1.4 }}>
                      {descText}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MAIN ACTION BUTTON */}
            <button
              disabled={!answers[prob.id]}
              onClick={handleVerifyOrAdvance}
              style={{
                width: '100%',
                height: '54px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.01em',
                border: 'none',
                cursor: !answers[prob.id] ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                marginTop: '4px',
                ...(isFlipped && isProbCorrect
                  ? { background: 'var(--clr-correct)', color: '#ffffff', boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }
                  : isFlipped && isProbWrong
                    ? { background: 'var(--clr-accent)', color: '#ffffff', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }
                    : !answers[prob.id]
                      ? { background: 'var(--clr-surface)', color: 'var(--clr-text-soft)' }
                      : { background: 'var(--clr-accent)', color: '#ffffff', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' })
              }}
            >
              {!answers[prob.id]
                ? 'Select a schema to continue'
                : isFlipped
                  ? isProbCorrect
                    ? 'Next question →'
                    : 'Try again ↻'
                  : 'Flip to verify ↻'}
            </button>


          </div>

          {/* RIGHT SIDEBAR: LEVEL PROGRESS & SCHEMA MASTERY */}
          {showSidebar && (
            <div className="schema-progress-sidebar" style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: '12px',
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              alignSelf: 'flex-start',
              width: '260px',
              boxShadow: 'var(--shadow-card)',
              animation: 'hintSlideDown 0.3s ease forwards'
            }}>
              {/* 1. LEVEL PROGRESS */}
              <div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--clr-text-soft)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '16px'
                }}>
                  Level Progress
                </div>

                {/* Circular Donut Ring Chart */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6px 0' }}>
                  <div style={{ position: 'relative', width: '136px', height: '136px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="136" height="136" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="var(--clr-surface)"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="var(--clr-accent)"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - (currentQuestions.length > 0 ? (correctCount / currentQuestions.length) : 0))}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--clr-text)', lineHeight: 1 }}>
                        {currentQuestions.length > 0 ? Math.round((correctCount / currentQuestions.length) * 100) : 0}%
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
                        COMPLETE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. SCHEMA MASTERY WITH STAR RATINGS */}
              <div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--clr-text-soft)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '16px'
                }}>
                  Schema Mastery
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Combine */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--clr-accent-combine)' }}>Combine <span style={{ color: '#eab308', fontSize: '0.75rem' }}>★★★</span></span>
                      <span style={{ color: 'var(--clr-accent-combine)' }}>{combinePercent}%</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--clr-surface)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${combinePercent}%`, background: 'var(--clr-accent-combine)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  {/* Compare */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--clr-accent-compare)' }}>Compare <span style={{ color: '#eab308', fontSize: '0.75rem' }}>★★★</span></span>
                      <span style={{ color: 'var(--clr-accent-compare)' }}>{comparePercent}%</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--clr-surface)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${comparePercent}%`, background: 'var(--clr-accent-compare)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  {/* Change */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--clr-accent-change)' }}>Change <span style={{ color: '#eab308', fontSize: '0.75rem' }}>★★★</span></span>
                      <span style={{ color: 'var(--clr-accent-change)' }}>{changePercent}%</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--clr-surface)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${changePercent}%`, background: 'var(--clr-accent-change)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LEVEL COMPLETE SCREEN OVERLAY */}
        {levelPassed && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px',
              boxShadow: 'var(--shadow-card)'
            }}>
              {/* Large animated ✓ in green circle */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#22c55e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 700,
                boxShadow: '0 0 24px rgba(34, 197, 94, 0.4)'
              }}>
                ✓
              </div>

              {/* Title */}
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
                  Level {activeLevel} Complete!
                </h2>
                <div style={{ fontSize: '14px', color: '#eab308', fontWeight: 700, marginTop: '6px' }}>
                  You earned {correctCount * 15} Points
                </div>
              </div>

              {/* Star rating based on overall accuracy */}
              <div style={{ fontSize: '32px', color: '#eab308', letterSpacing: '4px' }}>
                {overallAccuracy >= 90 ? '★★★' : overallAccuracy >= 70 ? '★★☆' : '★☆☆'}
              </div>

              {/* Final mastery summary showing all 3 schema bars */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', background: '#312b27', padding: '16px', borderRadius: '8px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em', color: '#a89f96', textAlign: 'left', textTransform: 'uppercase' }}>
                  FINAL SCHEMA MASTERY
                </div>

                {/* Combine bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: '#a855f7' }}>Combine</span>
                    <span style={{ color: '#a855f7' }}>{combinePercent}%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: '#2a2420', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${combinePercent}%`, background: '#a855f7', borderRadius: '9999px' }} />
                  </div>
                </div>

                {/* Compare bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: '#06b6d4' }}>Compare</span>
                    <span style={{ color: '#06b6d4' }}>{comparePercent}%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: '#2a2420', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${comparePercent}%`, background: '#06b6d4', borderRadius: '9999px' }} />
                  </div>
                </div>

                {/* Change bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: '#3b82f6' }}>Change</span>
                    <span style={{ color: '#3b82f6' }}>{changePercent}%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: '#2a2420', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${changePercent}%`, background: '#3b82f6', borderRadius: '9999px' }} />
                  </div>
                </div>
              </div>

              {/* Two buttons */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setReviewQIndex(0);
                    setIsReviewMode(true);
                  }}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '8px',
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    color: 'var(--clr-text)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ← Review Cards
                </button>

                <button
                  onClick={() => {
                    if (activeLevel < 7) {
                      navigateToLevel(activeLevel + 1);
                    } else {
                      navigateToLevel(null);
                    }
                  }}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '8px',
                    background: 'var(--clr-accent)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {activeLevel < 7 ? 'Next Level →' : 'Overview →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* READ-ONLY QUESTION REVIEW MODE MODAL */}
        {isReviewMode && (() => {
          const reviewQuestions = QUESTIONS_BY_LEVEL[activeLevel] || [];
          return (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(26, 22, 20, 0.78)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '680px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: 'var(--shadow-card)',
                boxSizing: 'border-box'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--clr-border)', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      LEVEL {activeLevel} REVIEW MODE (READ-ONLY)
                    </div>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--clr-text)', fontWeight: 700 }}>
                      Question {reviewQIndex + 1} of {reviewQuestions.length}
                    </h3>
                  </div>

                  <button
                    onClick={() => setIsReviewMode(false)}
                    style={{
                      background: 'var(--clr-surface)',
                      border: '1px solid var(--clr-border)',
                      color: 'var(--clr-text)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ← Back to Summary
                  </button>
                </div>

              {/* Progress Dots */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {reviewQuestions.map((q, idx) => {
                  const userChoice = answers[q.id];
                  const isCorrect = isSchemaMatch(userChoice, q.type);
                  return (
                    <div
                      key={q.id}
                      onClick={() => setReviewQIndex(idx)}
                      title={`Q${idx + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`}
                      style={{
                        width: idx === reviewQIndex ? '28px' : '10px',
                        height: '8px',
                        borderRadius: '9999px',
                        background: isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                        opacity: idx === reviewQIndex ? 1 : 0.45,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  );
                })}
              </div>

              {/* Active Question Review Card */}
              {(() => {
                const currentQ = reviewQuestions[reviewQIndex] || reviewQuestions[0];
                if (!currentQ) return null;
                const userChoice = answers[currentQ.id];
                const isCorrect = isSchemaMatch(userChoice, currentQ.type);
                const options = optionsByQuestion[currentQ.id] || (activeLevel >= 1 && activeLevel <= 4 ? ['Combine', 'Compare', 'Change'] : SCHEMA_OPTIONS);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Status Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: isCorrect ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)',
                      border: isCorrect ? '1px solid var(--clr-correct)' : '1px solid var(--clr-wrong)',
                      color: isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                      fontWeight: 700,
                      fontSize: '0.95rem'
                    }}>
                      <span>{isCorrect ? '✓ Correct Answer' : '✕ Incorrect Answer'}</span>
                    </div>

                    {/* Question Text */}
                    <div style={{
                      background: 'var(--clr-surface)',
                      border: '1px solid var(--clr-border)',
                      padding: '20px',
                      borderRadius: '12px',
                      fontSize: '1.05rem',
                      lineHeight: 1.6,
                      color: 'var(--clr-text)',
                      fontWeight: 500
                    }}>
                      {currentQ.text}
                    </div>

                    {/* Schema Options (Read-Only) */}
                    <div style={{ display: 'grid', gridTemplateColumns: options.length <= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '12px' }}>
                      {options.map((opt) => {
                        const isSelected = userChoice === opt;
                        const isTargetCorrect = isSchemaMatch(opt, currentQ.type);

                        let optBg = 'var(--clr-card)';
                        let optBorder = 'var(--clr-border)';
                        let badgeText = null;
                        let badgeColor = 'var(--clr-text-soft)';

                        if (isTargetCorrect) {
                          optBg = 'var(--clr-correct-bg)';
                          optBorder = '2px solid var(--clr-correct)';
                          badgeText = '✓';
                          badgeColor = 'var(--clr-correct)';
                        } else if (isSelected && !isCorrect) {
                          optBg = 'var(--clr-wrong-bg)';
                          optBorder = '2px solid var(--clr-wrong)';
                          badgeText = '✕';
                          badgeColor = 'var(--clr-wrong)';
                        }

                        return (
                          <div
                            key={opt}
                            style={{
                              background: optBg,
                              border: optBorder,
                              borderRadius: '10px',
                              padding: '14px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              position: 'relative',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--clr-text)' }}>{opt}</span>
                              {badgeText && (
                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: badgeColor }}>
                                  {badgeText}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', lineHeight: 1.4 }}>
                              {SCHEMA_DESCRIPTIONS[opt]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Navigation Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--clr-border)', paddingTop: '16px', marginTop: '4px' }}>
                <button
                  onClick={() => setReviewQIndex(prev => Math.max(0, prev - 1))}
                  disabled={reviewQIndex === 0}
                  style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    color: 'var(--clr-text)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: reviewQIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: reviewQIndex === 0 ? 0.4 : 1
                  }}
                >
                  ← Previous
                </button>

                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                  {reviewQIndex + 1} / {reviewQuestions.length}
                </span>

                <button
                  onClick={() => setReviewQIndex(prev => Math.min(reviewQuestions.length - 1, prev + 1))}
                  disabled={reviewQIndex === reviewQuestions.length - 1}
                  style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    color: 'var(--clr-text)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: reviewQIndex === reviewQuestions.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: reviewQIndex === reviewQuestions.length - 1 ? 0.4 : 1
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
}


