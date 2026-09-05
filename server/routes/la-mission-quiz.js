'use strict';
const router = require('express').Router();
const fs = require('fs');
const path = require('path');

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const laQuestionsDir = path.join(__dirname, '..', '..', 'linearalgebra', 'questions');
const laMissionQuestions = {};
(function loadLAMissionQuestions() {
  try {
    const files = fs.readdirSync(laQuestionsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(laQuestionsDir, file), 'utf8'));
      const mid = data.missionId || data.mission_id;
      if (mid) laMissionQuestions[mid] = data;
    }
    console.log('Loaded LA mission questions for missions: ' + Object.keys(laMissionQuestions).join(', '));
  } catch (e) { /* directory may not exist yet */ }
})();

const MQ = (() => {
  const ri = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fv = (...c) => '(' + c.join(', ') + ')';
  const fm2 = (m) => '[' + m[0][0] + ',' + m[0][1] + ';' + m[1][0] + ',' + m[1][1] + ']';
  const rnd2 = (x) => Math.round(x * 100) / 100;

  const missionGens = {
    // â•â•â• Module 1: Linear Relations â•â•â•
    // Mission 1: Piggy Bank Detectives (direct proportion)
    1: {
      easy: [
        () => { const m=ri(2,5),x=ri(1,8); return {type:'m1_yval',answerType:'scalar',prompt:'If y = '+m+'x, what is y when x = '+x+'?',answer:String(m*x),display:String(m*x),data:{m,x}}; },
        () => { const m=ri(2,6); return {type:'m1_ratio',answerType:'scalar',prompt:'If y = '+m+'x, what is the ratio y:x?',answer:m+':1',display:m+':1',data:{m}}; },
        () => { const k=ri(2,5),b=ri(1,8),c=k*b; return {type:'m1_findk',answerType:'scalar',prompt:'A = '+c+' when B = '+b+'. If A = kB, find k.',answer:String(k),display:String(k),data:{k,b,c}}; },
        () => { return {type:'m1_app_trading',answerType:'scalar',prompt:'Two crypto trading bots: Bot Alpha profit is always exactly 3Ã— Bot Beta profit (A = 3B). If you plot their weekly profits (Bk, Ak) on a graph, what shape do the data points form?',answer:'A straight line passing through the origin (0,0) with a slope of 3',display:'A straight line through the origin with slope 3',choices:['A horizontal line given by y = 3','A straight line passing through the origin (0,0) with a slope of 3','A parabola opening upwards starting at (1, 3)','A circle centered at (0,0) with radius 3'],data:{}}; },
        () => { return {type:'m1_app_stoich',answerType:'scalar',prompt:'In an ammonia plant, N2 and H2 react in a fixed 1:3 ratio (H2 = 3N2). Which equation defines the line on which all data points (N2, H2) must lie?',answer:'H2 = 3 N2',display:'H2 = 3 N2',choices:['H2 = 3 N2','N2 = 3 H2','H2 = N2 + 3','H2 = 3 N2 + 1'],data:{}}; },
        () => { return {type:'m1_app_ev',answerType:'scalar',prompt:'A solar EV charging station: Station A delivers 50 kWh/hr, Station B delivers 25 kWh/hr. Plotting total energy (EB, EA) over time, why MUST the line pass through the origin?',answer:'Because at time t = 0 hours, both stations have delivered exactly 0 kWh of energy',display:'At t=0, both stations have delivered 0 kWh',choices:['Because Station A always charges at a constant rate of 0 kWh','Because at time t = 0 hours, both stations have delivered exactly 0 kWh of energy','Because the slope of the charging curve is zero','Because Station B charges twice as fast as Station A'],data:{}}; },
      ],
      medium: [
        () => { const m=ri(2,5),x=ri(1,6); return {type:'m1_eval',answerType:'scalar',prompt:'Ram saves '+m+'x what Lakshman saves. If Lakshman saves '+x+', what does Ram save?',answer:String(m*x),display:String(m*x),data:{m,x}}; },
        () => { const m1=ri(2,4),m2=m1*ri(2,3); return {type:'m1_compare',answerType:'scalar',prompt:'Two proportional relationships: y='+m1+'x and y='+m2+'x. What is the ratio of their slopes?',answer:String(m2/m1),display:String(m2/m1),data:{m1,m2}}; },
        () => { const m=ri(2,5),x=ri(1,10); return {type:'m1_origin',answerType:'scalar',prompt:'For y = '+m+'x, what is y when x = 0? Does it pass through origin?',answer:'0',display:'0 (yes, origin)',data:{m,x}}; },
        () => { return {type:'m1_app_gear',answerType:'scalar',prompt:'A dual-motor rover uses a gearbox where Motor 1 rotates at 2.5Ã— the speed of Motor 2 (M1 = 2.5 Â· M2). If Motor 2 has completed 18 full revolutions, how many has Motor 1 completed?',answer:'45',display:'45',data:{}}; },
        () => { return {type:'m1_app_aspect',answerType:'scalar',prompt:'A game engine scales textures maintaining 16:9 aspect ratio: W = m Â· H. What is the slope m rounded to 2 decimal places?',answer:'1.78',display:'1.78',data:{}}; },
      ],
      hard: [
        () => { const m=ri(2,4),x1=ri(1,5),x2=x1+ri(1,3); const y1=m*x1,y2=m*x2; return {type:'m1_slope',answerType:'scalar',prompt:'Points ('+x1+','+y1+') and ('+x2+','+y2+') are from y='+m+'x. What is the slope?',answer:String(m),display:String(m),data:{m,x1,x2,y1,y2}}; },
        () => { const m=ri(2,5),b=ri(1,5); return {type:'m1_notprop',answerType:'scalar',prompt:'y = '+m+'x + '+b+' is NOT proportional. What value of b makes it proportional?',answer:'0',display:'0',data:{m,b}}; },
        () => { const a=ri(1,5),x=ri(1,5),y=a*x; return {type:'m1_inverse',answerType:'scalar',prompt:'If y = '+a+'x and y = '+y+', find x.',answer:String(x),display:String(x),data:{a,x,y}}; },
      ],
    },
    // Mission 2: Treasure Map (collinearity)
    2: {
      easy: [
        () => { const y1=ri(1,5); return {type:'m2_slope',answerType:'scalar',prompt:'Slope between (1,0) and (2,'+y1+')?',answer:String(y1),display:String(y1),data:{x1:2,y1}}; },
        () => { return {type:'m2_collinear',answerType:'scalar',prompt:'Are (2,1), (3,2), (4,3) collinear? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m2_next',answerType:'scalar',prompt:'Next point in pattern (2,1), (3,2), (4,3)?',answer:'(5,4)',display:'(5,4)',data:{}}; },
        () => { return {type:'m2_app_cnc',answerType:'scalar',prompt:'CNC laser cutter drills Hole A at (3,2), Hole B at (5,4), Hole C at (7,6). Are they collinear, and what is the slope?',answer:'Yes, the slope is 1',display:'Yes, slope = 1',choices:['Yes, the slope is 1','Yes, the slope is 2','No, they form a curve','Yes, the slope is 0.5'],data:{}}; },
        () => { return {type:'m2_app_raycast',answerType:'scalar',prompt:'A game engine highlights pixels at (2,1), (3,2), (4,3). What is the equation of the continuous line through these points?',answer:'y = x - 1',display:'y = x - 1',choices:['y = x + 1','y = x - 1','y = 2x - 1','y = x'],data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,3),b=ri(1,5); return {type:'m2_equation',answerType:'scalar',prompt:'Line through (2,1) and (3,2): what is y when x='+(a+5)+'?',answer:String(a+4),display:String(a+4),data:{a,b}}; },
        () => { const m=ri(1,4),x1=ri(1,3),y1=m*x1-1; return {type:'m2_slope2',answerType:'scalar',prompt:'Slope through ('+x1+','+y1+') and ('+(x1+1)+','+(y1+m)+')?',answer:String(m),display:String(m),data:{m,x1,y1}}; },
        () => { const x=ri(2,6); return {type:'m2_check',answerType:'scalar',prompt:'Is point ('+x+','+(x-1)+') on line y = x - 1? (1=yes,0=no)',answer:'1',display:'Yes',data:{x}}; },
        () => { return {type:'m2_app_drone',answerType:'scalar',prompt:'A drone maps drops at (3,1), (4,3), (5,5). These lie on y = mx + c. What is the y-intercept c?',answer:'-5',display:'-5',data:{}}; },
        () => { return {type:'m2_app_rivet',answerType:'scalar',prompt:'Rivets at (2,4), (4,7), (6,10). At what y-coordinate is Rivet 5 (x=10)?',answer:'16',display:'16',data:{}}; },
      ],
      hard: [
        () => { const x1=ri(1,3),y1=ri(1,3),x2=x1+ri(1,3),y2=y1+ri(1,3); const x3=x2+ri(1,3),y3=y2+ri(1,3); const collinear=((y2-y1)*(x3-x2)===(y3-y2)*(x2-x1)); return {type:'m2_area',answerType:'scalar',prompt:'Area of triangle with vertices ('+x1+','+y1+'), ('+x2+','+y2+'), ('+x3+','+y3+')? (if collinear, 0)',answer:String(Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2)),display:String(Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2)),data:{x1,y1,x2,y2,x3,y3}}; },
        () => { const m=ri(1,4),x0=ri(2,4); const y0=m*(x0-1); const x3=x0+1,y3=m*x0; return {type:'m2_extend',answerType:'scalar',prompt:'Points (1,0), ('+x0+','+y0+'), ('+x3+','+y3+'). Slope?',answer:String(m),display:String(m),data:{m,x0,y0,x3,y3}}; },
        () => { const m=ri(2,5); return {type:'m2_perpslope',answerType:'scalar',prompt:'Line perpendicular to y = '+m+'x - 1 has slope?',answer:String(rnd2(-1/m)),display:String(rnd2(-1/m)),data:{m}}; },
      ],
    },
    // Mission 3: Darts at the Origin (y=ax through origin)
    3: {
      easy: [
        () => { const a=ri(1,8); return {type:'m3_through',answerType:'scalar',prompt:'Does y = '+a+'x pass through origin? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
        () => { const a=ri(1,5),x=ri(1,5); return {type:'m3_yval',answerType:'scalar',prompt:'y = '+a+'x. When x = '+x+', y = ?',answer:String(a*x),display:String(a*x),data:{a,x}}; },
        () => { return {type:'m3_not',answerType:'scalar',prompt:'Does y = 2x + 1 pass through origin? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
        () => { return {type:'m3_app_bandwidth',answerType:'scalar',prompt:'Three servers: A follows y=x, B follows y=2x, C follows y=10x (data in GB vs hours). What does Server C\'s steeper line represent?',answer:'Server C transfers data at a much faster rate (higher bandwidth).',display:'Higher bandwidth',choices:['Server C has a higher network latency.','Server C transfers data at a much faster rate (higher bandwidth).','Server C started transferring data earlier than the others.','Server C has reached its maximum data capacity.'],data:{}}; },
        () => { return {type:'m3_app_vehicle',answerType:'scalar',prompt:'Three drones: fastest follows y=10x, slowest follows y=x. How many meters ahead is the fastest at 5 seconds?',answer:'45',display:'45',data:{}}; },
        () => { return {type:'m3_app_currency',answerType:'scalar',prompt:'Currency conversion: P follows y=x, Q follows y=2x, R follows y=10x (x=USD, y=foreign). Which is mathematically true?',answer:'1 USD buys 10 units of Currency R, meaning Currency R is actually weaker per unit than USD.',display:'Currency R is weaker per unit',choices:['Currency R is the strongest currency because it has the steepest line.','1 USD buys 10 units of Currency R, meaning Currency R is actually weaker per unit than USD.','Currency P fluctuates the least over time.','Currency Q has a constant inflation rate of 2%.'],data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,6); return {type:'m3_neg',answerType:'scalar',prompt:'Does y = -'+a+'x pass through origin? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
        () => { const a=ri(1,5),b=ri(-3,3); return {type:'m3_intercept',answerType:'scalar',prompt:'y = '+a+'x + '+b+' passes through origin only if b = ?',answer:'0',display:'0',data:{a,b}}; },
        () => { const a=ri(2,5); return {type:'m3_scalar',answerType:'scalar',prompt:'For y='+a+'x, is (3,'+(3*a)+') a scalar multiple of (1,'+a+')? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
        () => { return {type:'m3_app_factory',answerType:'scalar',prompt:'A factory\'s new machine produces 120 units in 12 hours (from origin). What is the slope of its line?',answer:'10',display:'10',data:{}}; },
        () => { return {type:'m3_app_pharma',answerType:'scalar',prompt:'Three solutions plotted as y=x, y=2x, y=10x (active ingredient vs water). How do you identify the most concentrated from the graph?',answer:'The most concentrated solution has the line that rises the fastest (steepest).',display:'Steepest line = most concentrated',choices:['The most concentrated solution has the line that is closest to the x-axis.','The most concentrated solution has the line that rises the fastest (steepest).','The most concentrated solution is the one that crosses the y-intercept at the highest point.','Concentration cannot be determined visually from these lines alone.'],data:{}}; },
      ],
      hard: [
        () => { const a1=ri(1,5),a2=ri(1,5); return {type:'m3_intersect',answerType:'scalar',prompt:'y='+a1+'x and y='+a2+'x intersect at which point?',answer:'(0,0)',display:'(0,0)',data:{a1,a2}}; },
        () => { const a=ri(1,5); return {type:'m3_proportional',answerType:'scalar',prompt:'y='+a+'x is proportional. What is the constant of proportionality?',answer:String(a),display:String(a),data:{a}}; },
        () => { const x=ri(1,5),a=ri(2,5); return {type:'m3_findx',answerType:'scalar',prompt:'On y='+a+'x, a point has y='+(a*x)+'. What is x?',answer:String(x),display:String(x),data:{a,x}}; },
      ],
    },
    // Mission 4: The Brick Wall (y=mx+b intercept)
    4: {
      easy: [
        () => { const m=ri(2,5),b=ri(1,8); return {type:'m4_yint',answerType:'scalar',prompt:'What is the y-intercept of y = '+m+'x + '+b+'?',answer:String(b),display:String(b),data:{m,b}}; },
        () => { const m=ri(2,4),b=ri(1,5); return {type:'m4_atzero',answerType:'scalar',prompt:'y = '+m+'x + '+b+'. What is y when x = 0?',answer:String(b),display:String(b),data:{m,b}}; },
        () => { const m=ri(1,5); return {type:'m4_shift',answerType:'scalar',prompt:'y = '+m+'x + 3 shifts the line y = '+m+'x up by how many units?',answer:'3',display:'3',data:{m}}; },
        () => { return {type:'m4_app_cloud',answerType:'scalar',prompt:'Platform A: y=0.05x (per-GB storage). Platform B: y=0.02x+10 ($10 monthly fee). Why does Platform B\'s line not pass through origin?',answer:'Because there is a baseline cost of $10 even if absolutely zero data is stored.',display:'Baseline $10 fee at zero usage',choices:['Because the competitor charges a lower rate per GB.','Because there is a baseline cost of $10 even if absolutely zero data is stored.','Because the slope of the competitor\'s line is less than 1.','Because cloud storage cannot theoretically be zero.'],data:{}}; },
      ],
      medium: [
        () => { const m=ri(2,5),b=ri(1,5),x=ri(1,5); return {type:'m4_eval',answerType:'scalar',prompt:'y = '+m+'x + '+b+'. What is y when x = '+x+'?',answer:String(m*x+b),display:String(m*x+b),data:{m,b,x}}; },
        () => { const b=ri(1,6); return {type:'m4_cross',answerType:'scalar',prompt:'Where does y = 3x + '+b+' cross the y-axis?',answer:'(0,'+b+')',display:'(0,'+b+')',data:{b}}; },
        () => { const m=ri(2,5); return {type:'m4_noshift',answerType:'scalar',prompt:'y = '+m+'x + 0 passes through which special point?',answer:'(0,0)',display:'(0,0) - origin',data:{m}}; },
        () => { return {type:'m4_app_balloon',answerType:'scalar',prompt:'A weather balloon follows y = 5x + c. If the y-intercept is exactly 150, what was the launch altitude in meters?',answer:'150',display:'150',data:{}}; },
        () => { return {type:'m4_app_rideshare',answerType:'scalar',prompt:'Ride-share fare: y = 2.5x + 3.5. What is the cost if passenger cancels at 0 miles?',answer:'3.5',display:'3.5',data:{}}; },
      ],
      hard: [
        () => { const m=ri(2,4),b1=ri(1,5),b2=b1+ri(1,4); return {type:'m4_parallel',answerType:'scalar',prompt:'y='+m+'x+'+b1+' and y='+m+'x+'+b2+' are parallel. Distance between intercepts?',answer:String(b2-b1),display:String(b2-b1),data:{m,b1,b2}}; },
        () => { const m=ri(1,4),x=ri(1,5); return {type:'m4_frompts',answerType:'scalar',prompt:'Line through (0,3) and ('+x+','+(m*x+3)+'). What is the slope?',answer:String(m),display:String(m),data:{m,x}}; },
        () => { const m1=ri(2,5),b=ri(1,5); return {type:'m4_compare',answerType:'scalar',prompt:'y='+m1+'x+'+b+' vs y='+m1+'x+'+(b+1)+'. How many units higher is the second line at any x?',answer:'1',display:'1',data:{m1,b}}; },
      ],
    },
    // Mission 5: Game Controller (slope & intercept sliders)
    5: {
      easy: [
        () => { const m=ri(1,6); return {type:'m5_steep',answerType:'scalar',prompt:'Which is steeper: y='+m+'x or y='+(m+2)+'x?',answer:String(m+2),display:'y='+(m+2)+'x',data:{m}}; },
        () => { const b=ri(-5,5); return {type:'m5_intercept',answerType:'scalar',prompt:'Setting a=0, b='+b+' gives horizontal line at y = ?',answer:String(b),display:String(b),data:{b}}; },
        () => { return {type:'m5_zero',answerType:'scalar',prompt:'a=0, b=0 gives y = ? What kind of line?',answer:'0',display:'0 (x-axis)',data:{}}; },
        () => { return {type:'m5_app_thermo',answerType:'scalar',prompt:'Temperature scales: K = C + 273.15. Why doesn\'t the Celsius-Kelvin line pass through (0,0)?',answer:'Because zero degrees Celsius does not represent an absolute absence of heat energy.',display:'0Â°C â‰  absolute zero',choices:['Because temperature scales do not follow linear relationships.','Because zero degrees Celsius does not represent an absolute absence of heat energy.','Because the slope of the line is 273.15.','Because Kelvin can be negative while Celsius cannot.'],data:{}}; },
      ],
      medium: [
        () => { const m=ri(1,5),b=ri(-3,3),x=ri(1,5); return {type:'m5_both',answerType:'scalar',prompt:'Line: slope='+m+', intercept='+b+'. What is y at x='+x+'?',answer:String(m*x+b),display:String(m*x+b),data:{m,b,x}}; },
        () => { const m1=ri(1,5),m2=m1+2; return {type:'m5_angle',answerType:'scalar',prompt:'Slope '+m1+' vs slope '+m2+': which makes a larger angle with x-axis?',answer:String(m2),display:'slope '+m2,data:{m1,m2}}; },
        () => { const m=ri(1,5); return {type:'m5_negative',answerType:'scalar',prompt:'Negative slope means the line goes _____ as x increases.',answer:'down',display:'Down',data:{m}}; },
        () => { return {type:'m5_app_mlbias',answerType:'scalar',prompt:'Neuron: Output = (Weight Ã— Input) + Bias. If Bias is set to 0, what happens to the line?',answer:'The line shifts to pass perfectly through the origin (0,0).',display:'Passes through origin',choices:['The line becomes completely horizontal.','The line becomes completely vertical.','The line shifts to pass perfectly through the origin (0,0).','The line becomes a parabola.'],data:{}}; },
      ],
      hard: [
        () => { const m1=ri(1,4),m2=-1/m1; return {type:'m5_perp',answerType:'scalar',prompt:'Slope perpendicular to '+rnd2(m1)+' is '+rnd2(m2)+'? Product = ?',answer:'-1',display:'-1',data:{m1,m2}}; },
        () => { const m=ri(2,5),b=ri(1,5),x=ri(1,8); return {type:'m5_model',answerType:'scalar',prompt:'Taxi: base fare = '+b+', per km = '+m+'. Total for '+x+' km?',answer:String(m*x+b),display:String(m*x+b),data:{m,b,x}}; },
        () => { const m1=ri(1,4),b1=ri(-3,3),m2=ri(1,4),b2=ri(-3,3); return {type:'m5_intersect',answerType:'scalar',prompt:'y='+m1+'x+'+b1+' and y='+m2+'x+'+b2+' have different slopes. How many intersection points?',answer:'1',display:'1',data:{m1,b1,m2,b2}}; },
      ],
    },
    // â•â•â• Module 1: Systems & Functions â•â•â•
    // Mission 6: Meeting Point (systems â†’ matrix form)
    6: {
      easy: [
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m6_verify',answerType:'scalar',prompt:'Is x='+x+', y='+y+' a solution to x+y='+(x+y)+'? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y}}; },
        () => { return {type:'m6_count',answerType:'scalar',prompt:'How many unknowns in: 2x + 3y = 7?',answer:'2',display:'2',data:{}}; },
        () => { const x=ri(1,5); return {type:'m6_easy',answerType:'scalar',prompt:'2x = '+(2*x)+'. Find x.',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { const x=ri(-3,3),y=ri(-3,3); const a=ri(1,4),b=ri(1,4),c=a*x+b*y; return {type:'m6_solve',answerType:'scalar',prompt:'Solve: '+a+'x+'+b+'y='+c+' and x+y='+(x+y)+'. Find x.',answer:String(x),display:String(x),data:{a,b,c,x,y}}; },
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m6_matrix',answerType:'scalar',prompt:'For 2x+3y=7 and x+2y=5, the coefficient matrix is [[2,3],[1,2]]. What is its determinant?',answer:'1',display:'1',data:{x,y}}; },
        () => { return {type:'m6_unique',answerType:'scalar',prompt:'For a unique solution, the determinant of the coefficient matrix must be _____.',answer:'non-zero',display:'Non-zero',data:{}}; },
      ],
      hard: [
        () => { const x=ri(-3,3),y=ri(-3,3); const a1=ri(1,3),b1=ri(1,3),c1=a1*x+b1*y; let a2,b2,c2; do{a2=ri(1,3);b2=ri(1,3);}while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'m6_2x2',answerType:'scalar',prompt:'Solve: '+a1+'x+'+b1+'y='+c1+', '+a2+'x+'+b2+'y='+c2+'. Find x.',answer:String(x),display:String(x),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
        () => { const x=ri(-3,3),y=ri(-3,3); const a1=ri(1,3),b1=ri(1,3),c1=a1*x+b1*y; let a2,b2,c2; do{a2=ri(1,3);b2=ri(1,3);}while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'m6_2x2y',answerType:'scalar',prompt:'Solve: '+a1+'x+'+b1+'y='+c1+', '+a2+'x+'+b2+'y='+c2+'. Find y.',answer:String(y),display:String(y),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m6_det',answerType:'scalar',prompt:'det('+fm2(A)+') = '+det+'. Is detâ‰ 0?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
      ],
    },
    // Mission 7: Time Machine (invertible functions)
    7: {
      easy: [
        () => { const a=ri(2,5),x=ri(1,5); return {type:'m7_invert',answerType:'scalar',prompt:'f(x)='+a+'x. What is f^-1('+(a*x)+')?',answer:String(x),display:String(x),data:{a,x}}; },
        () => { const a=ri(1,5); return {type:'m7_oneone',answerType:'scalar',prompt:'f(x)='+a+'x+2. Is it one-to-one? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
        () => { const a=ri(2,5); return {type:'m7_formula',answerType:'scalar',prompt:'f(x)='+a+'x. f^-1(y) = y/',answer:String(a),display:'y/'+a,data:{a}}; },
      ],
      medium: [
        () => { const a=ri(1,5),b=ri(-5,5),x=ri(1,5); return {type:'m7_eval',answerType:'scalar',prompt:'f(x)='+a+'x+'+b+'. f('+x+')?',answer:String(a*x+b),display:String(a*x+b),data:{a,b,x}}; },
        () => { const a=ri(2,5),b=ri(1,5); return {type:'m7_inveq',answerType:'scalar',prompt:'f(x)='+a+'x+'+b+'. f^-1('+(a*3+b)+') = ?',answer:'3',display:'3',data:{a,b}}; },
        () => { const a=ri(1,5); return {type:'m7_injective',answerType:'scalar',prompt:'f(x)='+a+'x. Injective means every y-value maps to exactly ___ x-value(s).',answer:'1',display:'1',data:{a}}; },
      ],
      hard: [
        () => { const a=ri(1,4),b=ri(-3,3); return {type:'m7_invformula',answerType:'scalar',prompt:'f(x)='+a+'x+'+b+'. f^-1(y) = (y-'+b+')/',answer:String(a),display:'(y-'+b+')/'+a,data:{a,b}}; },
        () => { const a=ri(1,5); return {type:'m7_identity',answerType:'scalar',prompt:'f(f^-1(x)) = ? for invertible function f.',answer:'x',display:'x',data:{a}}; },
        () => { const a=ri(2,5),x=ri(1,5); return {type:'m7_comp',answerType:'scalar',prompt:'f(x)='+a+'x, g(x)=x/'+a+'. f(g('+x+'))?',answer:String(x),display:String(x),data:{a,x}}; },
      ],
    },
    // Mission 8: Parabola Slide (evaluate by tracing)
    8: {
      easy: [
        () => { const x=ri(1,5); return {type:'m8_square',answerType:'scalar',prompt:'f(x) = x^2. What is f('+x+')?',answer:String(x*x),display:String(x*x),data:{x}}; },
        () => { const a=ri(1,4),x=ri(1,4); return {type:'m8_quad',answerType:'scalar',prompt:'f(x) = x^2 - '+a+'. f('+x+')?',answer:String(x*x-a),display:String(x*x-a),data:{a,x}}; },
        () => { return {type:'m8_fzero',answerType:'scalar',prompt:'f(x) = x^2 - 9. What is f(3)?',answer:'0',display:'0',data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,5); return {type:'m8_invert',answerType:'scalar',prompt:'f(x)=x^2-'+a+'. Is it invertible over all reals? (1=yes,0=no)',answer:'0',display:'No',data:{a}}; },
        () => { const x=ri(1,5); return {type:'m8_two',answerType:'scalar',prompt:'f(x)=x^2. f('+x+') = f('+(-x)+'). Two inputs give same output. Invertible? (1=yes,0=no)',answer:'0',display:'No',data:{x}}; },
        () => { const a=ri(1,4); return {type:'m8_vertex',answerType:'scalar',prompt:'f(x)=x^2-'+a+'. Where is the vertex? x = ?',answer:'0',display:'0',data:{a}}; },
      ],
      hard: [
        () => { const a=ri(1,3),b=ri(1,5); return {type:'m8_factored',answerType:'scalar',prompt:'f(x)=x^2-'+a+'x+'+b+'. How many real roots does x^2-'+a+'x+'+b+'=0 have?',answer:String((a*a-4*b>=0)?((a*a-4*b>0)?2:1):0),display:String((a*a-4*b>=0)?((a*a-4*b>0)?2:1):0),data:{a,b}}; },
        () => { const x=ri(1,5); return {type:'m8_symmetry',answerType:'scalar',prompt:'f(x)=x^2. f(a)=f(-a) means f is symmetric about which axis?',answer:'y-axis',display:'y-axis',data:{x}}; },
        () => { const a=ri(1,4); return {type:'m8_restrict',answerType:'scalar',prompt:'f(x)=x^2-'+a+'. If restricted to x>=0, is it invertible? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
      ],
    },
    // Mission 9: Hit the Target (inverse not a function)
    9: {
      easy: [
        () => { const x=ri(1,5); return {type:'m9_quad',answerType:'scalar',prompt:'Can x^2 = '+(x*x)+' have two solutions? (1=yes,0=no)',answer:'1',display:'Yes',data:{x}}; },
        () => { const a=ri(1,5); return {type:'m9_intersects',answerType:'scalar',prompt:'y=x^2 and y='+(a*a)+' intersect at how many points?',answer:'2',display:'2',data:{a}}; },
        () => { const x=ri(1,5); return {type:'m9_posneg',answerType:'scalar',prompt:'x^2='+(x*x)+'. Name one positive solution.',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { const x=ri(1,5); return {type:'m9_both',answerType:'scalar',prompt:'x^2='+(x*x)+'. What are the two solutions?',answer:x+' and '+(-x),display:x+' and '+(-x),data:{x}}; },
        () => { return {type:'m9_fail',answerType:'scalar',prompt:'Why does f(x)=x^2 fail the horizontal line test?',answer:'multiple x for same y',display:'Same y for +x and -x',data:{}}; },
        () => { const a=ri(1,4); return {type:'m9_real',answerType:'scalar',prompt:'x^2+'+a+'=0. How many real solutions?',answer:'0',display:'0',data:{a}}; },
      ],
      hard: [
        () => { const a=ri(2,4); return {type:'m9_formula',answerType:'scalar',prompt:'x^2-'+(a*a)+'=0. Positive solution x = ?',answer:String(a),display:String(a),data:{a}}; },
        () => { const a=ri(1,4); return {type:'m9_shifted',answerType:'scalar',prompt:'f(x)=(x-'+a+')^2. f('+(a+3)+') = ?',answer:String(9),display:'9',data:{a}}; },
        () => { const a=ri(1,3),b=ri(1,3); const d=a*a-4*b; return {type:'m9_discrim',answerType:'scalar',prompt:'x^2-'+a+'x+'+b+'=0. Discriminant = '+d+'. Roots?',answer:d>0?'2':d===0?'1':'0',display:d>0?'2 real':d===0?'1 repeated':'0 real',data:{a,b,d}}; },
      ],
    },
    // Mission 10: Roller Coaster (cubic equations)
    10: {
      easy: [
        () => { const x=ri(1,3); return {type:'m10_cubic',answerType:'scalar',prompt:'f(x) = x^3. What is f('+x+')?',answer:String(x*x*x),display:String(x*x*x),data:{x}}; },
        () => { return {type:'m10_degree',answerType:'scalar',prompt:'A cubic polynomial has maximum how many real roots?',answer:'3',display:'3',data:{}}; },
        () => { const x=ri(1,3); return {type:'m10_cube_root',answerType:'scalar',prompt:'x^3 = '+(x*x*x)+'. What is x?',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { return {type:'m10_onesol',answerType:'scalar',prompt:'How many real solutions does x^3 = 27 have?',answer:'1',display:'1',data:{}}; },
        () => { const a=ri(1,3); return {type:'m10_positive',answerType:'scalar',prompt:'x^3 = '+(a*a*a)+'. How many positive real solutions?',answer:'1',display:'1',data:{a}}; },
        () => { return {type:'m10_odd',answerType:'scalar',prompt:'Why does every odd-degree polynomial have at least one real root?',answer:'endpoints go opposite directions',display:'Opposite signs at Â±âˆž',data:{}}; },
      ],
      hard: [
        () => { const x=ri(1,3); return {type:'m10_factor',answerType:'scalar',prompt:'x^3-'+x+'=0. Factor: x(x-1)(x+1)=0. How many real roots?',answer:'3',display:'3',data:{x}}; },
        () => { const a=ri(1,3); return {type:'m10_complex',answerType:'scalar',prompt:'x^3=1 has 1 real root. How many complex roots total?',answer:'3',display:'3',data:{a}}; },
        () => { const x=ri(1,3); return {type:'m10_sum',answerType:'scalar',prompt:'x^3=27. x^3-27=0. Factor: (x-3)(x^2+3x+9)=0. Number of real roots?',answer:'1',display:'1',data:{x}}; },
      ],
    },
    // â•â•â• Module 1: Dimensions â•â•â•
    // Mission 11: Dimensional Portal (1D, 2D, 3D)
    11: {
      easy: [
        () => { return {type:'m11_r3',answerType:'scalar',prompt:'How many coordinates does a point in R^3 need?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m11_r2',answerType:'scalar',prompt:'Point on a plane needs how many coordinates?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m11_r1',answerType:'scalar',prompt:'Point on a line needs how many coordinates?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const v=[ri(1,5),ri(1,5),ri(1,5)]; return {type:'m11_vecdim',answerType:'scalar',prompt:'Vector '+fv(...v)+' lives in which space?',answer:'R^3',display:'R^3',data:{v}}; },
        () => { return {type:'m11_notation',answerType:'scalar',prompt:'What is the notation for 2D real coordinate plane?',answer:'R^2',display:'R^2',data:{}}; },
        () => { return {type:'m11_5d',answerType:'scalar',prompt:'A data point with 5 measurements lives in R^?',answer:'5',display:'R^5',data:{}}; },
      ],
      hard: [
        () => { const n=ri(2,6); return {type:'m11_nd',answerType:'scalar',prompt:'A vector in R^n has ___ components.',answer:String(n),display:String(n),data:{n}}; },
        () => { return {type:'m11_origin',answerType:'scalar',prompt:'The origin (0,0,0) is a _-dimensional object.',answer:'0',display:'0',data:{}}; },
        () => { const d=ri(1,5); return {type:'m11_span',answerType:'scalar',prompt:'Span of one vector in R^'+(d+1)+' is _-dimensional.',answer:'1',display:'1 (a line)',data:{d}}; },
      ],
    },
    // Mission 12: Transformation Machine (matrix as function)
    12: {
      easy: [
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m12_col1',answerType:'scalar',prompt:'If phi(1,0) = ('+a+','+b+'), what is the first column of the matrix?',answer:'('+a+','+b+')',display:'('+a+','+b+')',data:{a,b}}; },
        () => { const c=ri(1,5),d=ri(1,5); return {type:'m12_col2',answerType:'scalar',prompt:'If phi(0,1) = ('+c+','+d+'), what is the second column?',answer:'('+c+','+d+')',display:'('+c+','+d+')',data:{c,d}}; },
        () => { return {type:'m12_linear',answerType:'scalar',prompt:'A matrix transformation is always _____.',answer:'linear',display:'Linear',data:{}}; },
      ],
      medium: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; return {type:'m12_apply',answerType:'scalar',prompt:'Matrix '+fm2(A)+' applied to (1,0) gives?',answer:'('+A[0][0]+','+A[1][0]+')',display:'('+A[0][0]+','+A[1][0]+')',data:{A}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m12_det',answerType:'scalar',prompt:'det('+fm2(A)+') = ? If non-zero, transformation is _____.',answer:String(det),display:String(det),data:{A,det}}; },
        () => { return {type:'m12_cols',answerType:'scalar',prompt:'The columns of a transformation matrix are the images of _____.',answer:'basis vectors',display:'Basis vectors (1,0) and (0,1)',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const x=ri(1,3),y=ri(1,3); const r=[A[0][0]*x+A[0][1]*y,A[1][0]*x+A[1][1]*y]; return {type:'m12_comp',answerType:'scalar',prompt:'A='+fm2(A)+', v=('+x+','+y+'). Av = ?',answer:fv(...r),display:fv(...r),data:{A,x,y,r}}; },
        () => { return {type:'m12_2x2',answerType:'scalar',prompt:'A 2Ã—2 matrix transforms how many dimensions?',answer:'2',display:'2',data:{}}; },
        () => { const A=[[1,0],[0,1]]; return {type:'m12_identity',answerType:'scalar',prompt:'Identity matrix IÃ—v = ?',answer:'v',display:'v (unchanged)',data:{A}}; },
      ],
    },
    // Mission 13: Jigsaw Puzzle (determinant & invertibility)
    13: {
      easy: [
        () => { const a=ri(1,4),d=ri(1,4); const A=[[a,0],[0,d]]; return {type:'m13_detdiag',answerType:'scalar',prompt:'det([['+a+',0],[0,'+d+']])?',answer:String(a*d),display:String(a*d),data:{a,d}}; },
        () => { return {type:'m13_zero',answerType:'scalar',prompt:'det([[1,2],[2,4]]) = ? Is it invertible?',answer:'0',display:'0 (not invertible)',data:{}}; },
        () => { const a=ri(1,5),d=ri(1,5); return {type:'m13_prod',answerType:'scalar',prompt:'For diagonal matrix, det = product of ___?',answer:'diagonal entries',display:'Diagonal entries '+a+'Ã—'+d+'='+String(a*d),data:{a,d}}; },
      ],
      medium: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_det',answerType:'scalar',prompt:'det('+fm2(A)+')?',answer:String(det),display:String(det),data:{A,det}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_invert',answerType:'scalar',prompt:'det(A)='+det+'. Invertible? (1=yes,0=no)',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m13_formula',answerType:'scalar',prompt:'For [[a,b],[c,d]], det = ?',answer:'ad-bc',display:'ad - bc',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,3),ri(1,3)],[ri(1,3),ri(1,3)]]; return {type:'m13_singular',answerType:'scalar',prompt:'det('+fm2(A)+')=0. Rank of A?',answer:'1',display:'1',data:{A}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_inverse_det',answerType:'scalar',prompt:'det(A)='+det+'. det(A^-1) = ?',answer:det!==0?String(rnd2(1/det)):'0',display:det!==0?String(rnd2(1/det)):'undefined',data:{A,det}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_connection',answerType:'scalar',prompt:'det(A)='+det+'. A is invertible?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
      ],
    },
    // Mission 14: The Vanishing Act (null space / kernel)
    14: {
      easy: [
        () => { return {type:'m14_det0',answerType:'scalar',prompt:'If det(A) = 0, what does that mean?',answer:'not invertible',display:'Not invertible',data:{}}; },
        () => { return {type:'m14_kernel',answerType:'scalar',prompt:'The set of vectors mapping to origin is called the _____.',answer:'null space',display:'Null space / Kernel',data:{}}; },
        () => { return {type:'m14_zero',answerType:'scalar',prompt:'Does the zero vector always belong to the null space? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { return {type:'m14_sing',answerType:'scalar',prompt:'A singular matrix maps some non-zero vectors to _____.',answer:'zero vector',display:'(0,0)',data:{}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m14_ns_dir',answerType:'scalar',prompt:'Null space direction of [[1,2],[2,4]]?',answer:'(-2,1)',display:'(-2,1)',data:{A}}; },
        () => { return {type:'m14_many',answerType:'scalar',prompt:'How many vectors map to origin for a singular matrix?',answer:'infinite',display:'Infinitely many',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,3); const A=[[a,a*2],[a*2,a*4]]; return {type:'m14_ns_calc',answerType:'scalar',prompt:'Null space of '+fm2(A)+' has dimension?',answer:'1',display:'1',data:{A}}; },
        () => { return {type:'m14_nsr',answerType:'scalar',prompt:'nullity + rank = ? (number of columns)',answer:String(2),display:String(2),data:{}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m14_verify',answerType:'scalar',prompt:'A=(-2,1) is in null space of [[1,2],[2,4]]. Check: first row dot A = ?',answer:'0',display:'0',data:{A}}; },
      ],
    },
    // â•â•â• Module 2: Matrix Applications â•â•â•
    // Mission 15: Hill Cipher (encryption via matrices)
    15: {
      easy: [
        () => { return {type:'m15_mult',answerType:'scalar',prompt:'Hill cipher encrypts using matrix _____.',answer:'multiplication',display:'Multiplication',data:{}}; },
        () => { return {type:'m15_mod',answerType:'scalar',prompt:'Hill cipher uses arithmetic mod ___',answer:'26',display:'26',data:{}}; },
        () => { return {type:'m15_decrypt',answerType:'scalar',prompt:'To decrypt Hill cipher, multiply by matrix _____.',answer:'inverse',display:'Inverse',data:{}}; },
      ],
      medium: [
        () => { const A=[[1,2],[0,1]]; const v=[ri(1,5),ri(1,5)]; const r=[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]]; return {type:'m15_apply',answerType:'scalar',prompt:'Encrypt '+fv(...v)+' with '+fm2(A)+'. First component?',answer:String(r[0]),display:String(r[0]),data:{A,v,r}}; },
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m15_det',answerType:'scalar',prompt:'det('+fm2(A)+')='+det+'. Can we decrypt? (1=yes,0=no)',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m15_identity',answerType:'scalar',prompt:'Hill cipher with identity matrix changes the message? (1=yes,0=no)',answer:'0',display:'No change',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m15_hill_det',answerType:'scalar',prompt:'Hill cipher matrix '+fm2(A)+'. det='+det+'. Can decrypt?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m15_2x2',answerType:'scalar',prompt:'Basic Hill cipher uses ___x___ matrices.',answer:'2x2',display:'2Ã—2',data:{}}; },
        () => { const A=[[2,3],[3,4]]; const v=[18,20]; const r=[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]]; return {type:'m15_encrypt',answerType:'scalar',prompt:'Encrypt (18,20) with [[2,3],[3,4]]. Second component?',answer:String(r[1]),display:String(r[1]),data:{A,v,r}}; },
      ],
    },
    // Mission 16: Baker's Cafe (overdetermined systems)
    16: {
      easy: [
        () => { const a=ri(1,4),b=ri(1,4); return {type:'m16_count',answerType:'scalar',prompt:'How many equations: '+a+'A + '+b+'C = 100, 2A + C = 50?',answer:'2',display:'2',data:{a,b}}; },
        () => { return {type:'m16_over',answerType:'scalar',prompt:'More equations than unknowns is called _____.',answer:'overdetermined',display:'Overdetermined',data:{}}; },
        () => { const x=ri(1,5); return {type:'m16_easy',answerType:'scalar',prompt:'2A = '+(2*x)+'. Find A.',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m16_solve',answerType:'scalar',prompt:'3A+1C='+(3*x+y)+' and 1A+2C='+(x+2*y)+'. Find A.',answer:String(x),display:String(x),data:{x,y}}; },
        () => { return {type:'m16_leastsq',answerType:'scalar',prompt:'Best approximation for overdetermined systems uses _____ method.',answer:'least squares',display:'Least squares',data:{}}; },
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m16_verify',answerType:'scalar',prompt:'Is A='+x+', C='+y+' a solution to A+C='+(x+y)+' and 2A-C='+(2*x-y)+'? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y}}; },
      ],
      hard: [
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m16_atb',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. A^T is ___x___.',answer:'2x3',display:'2Ã—3',data:{A}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; const AT=[[A[0][0],A[1][0],A[2][0]],[A[0][1],A[1][1],A[2][1]]]; const ATA=[[0,0],[0,0]]; for(let i=0;i<2;i++) for(let j=0;j<2;j++) for(let k=0;k<3;k++) ATA[i][j]+=AT[i][k]*A[k][j]; return {type:'m16_ata',answerType:'scalar',prompt:'A^TA for A=[[3,1],[1,2],[1,1]]. Entry (1,1)?',answer:String(ATA[0][0]),display:String(ATA[0][0]),data:{A,ATA}}; },
        () => { const x=ri(1,3),y=ri(1,3); return {type:'m16_overdet',answerType:'scalar',prompt:'System: A+C='+(x+y)+', 2A-C='+(2*x-y)+', 3A+2C='+(3*x+2*y)+'. 3 equations, 2 unknowns. Overdetermined?',answer:'1',display:'Yes',data:{x,y}}; },
      ],
    },
    // Mission 17: Markov Chain (state transitions)
    17: {
      easy: [
        () => { return {type:'m17_steady',answerType:'scalar',prompt:'Steady state means probabilities stop _____ after many steps.',answer:'changing',display:'Changing',data:{}}; },
        () => { return {type:'m17_matrix',answerType:'scalar',prompt:'A transition matrix maps current state to _____ state.',answer:'next',display:'Next',data:{}}; },
        () => { return {type:'m17_sum',answerType:'scalar',prompt:'Each row of a transition matrix must sum to _____.',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const P=[[0.7,0.3],[0.4,0.6]]; return {type:'m17_step',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]], start=[1,0]. State after 1 step, component 1?',answer:'0.7',display:'0.7',data:{P}}; },
        () => { return {type:'m17_steady_eq',answerType:'scalar',prompt:'Steady state Ï€ satisfies which equation?',answer:'Ï€P=Ï€',display:'Ï€P = Ï€',data:{}}; },
        () => { const P=[[0.8,0.2],[0.1,0.9]]; return {type:'m17_rows',answerType:'scalar',prompt:'P=[[0.8,0.2],[0.1,0.9]]. Row 1 sums to?',answer:'1',display:'1',data:{P}}; },
      ],
      hard: [
        () => { const P=[[0.7,0.3],[0.4,0.6]]; return {type:'m17_calc',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]]. Ï€â‚+Ï€â‚‚ = ?',answer:'1',display:'1',data:{P}}; },
        () => { return {type:'m17_eigen',answerType:'scalar',prompt:'Dominant eigenvalue of any Markov matrix?',answer:'1',display:'1',data:{}}; },
        () => { const P=[[0.7,0.3],[0.4,0.6]]; return {type:'m17_det',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]]. det(P) = ?',answer:String(rnd2(0.7*0.6-0.3*0.4)),display:String(rnd2(0.7*0.6-0.3*0.4)),data:{P}}; },
      ],
    },
    // Mission 18: Guess the Solution (overdetermined geometry)
    18: {
      easy: [
        () => { return {type:'m18_rows',answerType:'scalar',prompt:'Matrix [[3,1],[1,2],[1,1]] has how many rows?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m18_cols',answerType:'scalar',prompt:'Matrix [[3,1],[1,2],[1,1]] has how many columns?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m18_type',answerType:'scalar',prompt:'3 equations, 2 unknowns is _____determined.',answer:'over',display:'Over',data:{}}; },
      ],
      medium: [
        () => { return {type:'m18_exact',answerType:'scalar',prompt:'Can 3 equations with 2 unknowns have an exact solution? (1=yes,0=no)',answer:'1',display:'Yes (sometimes)',data:{}}; },
        () => { return {type:'m18_intersect',answerType:'scalar',prompt:'Two lines in a plane typically intersect at ___ point(s).',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m18_3lines',answerType:'scalar',prompt:'Three random lines in a plane usually meet at ___ point(s).',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { return {type:'m18_least',answerType:'scalar',prompt:'Minimize ||b-Ax||^2. This is called _____ squares.',answer:'least',display:'Least squares',data:{}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m18_transpose',answerType:'scalar',prompt:'For A=[[3,1],[1,2],[1,1]], A^T is ___x___.',answer:'2x3',display:'2Ã—3',data:{A}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m18_ata_det',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. A^T A = [[11,6],[6,6]]. det(A^TA)?',answer:String(11*6-6*6),display:String(11*6-6*6),data:{A}}; },
      ],
    },
    // â•â•â• Module 2 (cont): Why No Solution? â•â•â•
    // Mission 19: Why No Solution? (geometric view)
    19: {
      easy: [
        () => { return {type:'m19_intersect',answerType:'scalar',prompt:'Two non-parallel lines in a plane intersect at ___ point(s).',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m19_parallel',answerType:'scalar',prompt:'Two parallel lines intersect at ___ point(s).',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m19_three',answerType:'scalar',prompt:'Three lines through the same point are called _____.',answer:'concurrent',display:'Concurrent',data:{}}; },
      ],
      medium: [
        () => { return {type:'m19_unlikely',answerType:'scalar',prompt:'A 3rd random line is ___ likely to pass through the intersection of 2 lines.',answer:'unlikely',display:'Unlikely',data:{}}; },
        () => { return {type:'m19_geometric',answerType:'scalar',prompt:'An overdetermined system with no solution: the lines do not all _____.',answer:'intersect',display:'Intersect at one point',data:{}}; },
        () => { return {type:'m19_residual',answerType:'scalar',prompt:'The closest point to b in col(A) gives the minimum _____.',answer:'residual',display:'Residual',data:{}}; },
      ],
      hard: [
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m19_atb',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. A^T A is ___x___ matrix.',answer:'2x2',display:'2Ã—2',data:{A}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; const ATA=[[11,6],[6,6]]; const det=ATA[0][0]*ATA[1][1]-ATA[0][1]*ATA[1][0]; return {type:'m19_ata_det',answerType:'scalar',prompt:'A^T A = [[11,6],[6,6]]. det(A^T A) = ?',answer:String(det),display:String(det),data:{A,ATA,det}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m19_rows',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. Rows of A^T = columns of A. How many rows in A^T?',answer:'2',display:'2',data:{A}}; },
      ],
    },
    // â•â•â• Module 2: Markov Chains â•â•â•
    // Mission 20: Mood Markov Chain (2-state)
    20: {
      easy: [
        () => { return {type:'m20_prob',answerType:'scalar',prompt:'Transition probabilities must be between 0 and _____.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m20_rows',answerType:'scalar',prompt:'Each row of a transition matrix sums to _____.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m20_state',answerType:'scalar',prompt:'A 2-state Markov chain has a ___x___ transition matrix.',answer:'2x2',display:'2x2',data:{}}; },
      ],
      medium: [
        () => { const P=[[0.6,0.4],[0.3,0.7]]; return {type:'m20_step',answerType:'scalar',prompt:'P=[[0.6,0.4],[0.3,0.7]], start=[1,0]. Happy after 1 step?',answer:'0.6',display:'0.6',data:{P}}; },
        () => { return {type:'m20_steady',answerType:'scalar',prompt:'Steady state means Ï€P = _____.',answer:'Ï€',display:'Ï€',data:{}}; },
        () => { return {type:'m20_indep',answerType:'scalar',prompt:'Does steady state depend on initial state? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
      ],
      hard: [
        () => { const P=[[0.6,0.4],[0.3,0.7]]; return {type:'m20_det',answerType:'scalar',prompt:'P=[[0.6,0.4],[0.3,0.7]]. det(P) = ?',answer:String(rnd2(0.6*0.7-0.4*0.3)),display:String(rnd2(0.6*0.7-0.4*0.3)),data:{P}}; },
        () => { return {type:'m20_multi',answerType:'scalar',prompt:'Can a Markov chain have multiple steady states? (1=yes,0=no)',answer:'0',display:'No (if irreducible)',data:{}}; },
        () => { return {type:'m20_eigen',answerType:'scalar',prompt:'Steady state is the eigenvector of P with eigenvalue _____.',answer:'1',display:'1',data:{}}; },
      ],
    },
    // Mission 21: 3-State Location Chain
    21: {
      easy: [
        () => { return {type:'m21_states',answerType:'scalar',prompt:'A 3-state chain has a ___x___ transition matrix.',answer:'3x3',display:'3x3',data:{}}; },
        () => { return {type:'m21_equations',answerType:'scalar',prompt:'How many equations to find steady state of 3-state chain?',answer:'3',display:'3 (plus normalization)',data:{}}; },
        () => { return {type:'m21_norm',answerType:'scalar',prompt:'Ï€â‚ + Ï€â‚‚ + Ï€â‚ƒ = ?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { return {type:'m21_power',answerType:'scalar',prompt:'Can repeated matrix multiplication find steady state? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m21_indep2',answerType:'scalar',prompt:'Does steady state of 3-state chain depend on starting state? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
        () => { const P=[[0.5,0.3,0.2],[0.1,0.6,0.3],[0.2,0.2,0.6]]; return {type:'m21_sum',answerType:'scalar',prompt:'P=[[0.5,0.3,0.2],[0.1,0.6,0.3],[0.2,0.2,0.6]]. Row 1 sums to?',answer:'1',display:'1',data:{P}}; },
      ],
      hard: [
        () => { return {type:'m21_equations',answerType:'scalar',prompt:'Ï€P=Ï€ gives ___ independent equations for a 3-state chain.',answer:'3',display:'3',data:{}}; },
        () => { const P=[[0.5,0.3,0.2],[0.1,0.6,0.3],[0.2,0.2,0.6]]; return {type:'m21_row_sum',answerType:'scalar',prompt:'P 3Ã—3 Markov. Row 2 sums to?',answer:'1',display:'1',data:{P}}; },
        () => { return {type:'m21_converge',answerType:'scalar',prompt:'Regular Markov chain reaches _____ state after many steps.',answer:'steady',display:'Steady',data:{}}; },
      ],
    },
    // â•â•â• Module 3: Spaces & Transformations â•â•â•
    // Mission 22: Perpendicular Vectors 2D (dot product)
    22: {
      easy: [
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m22_dot',answerType:'scalar',prompt:'Dot product of ('+a+',0) and (0,'+b+')?',answer:'0',display:'0',data:{a,b}}; },
        () => { return {type:'m22_perp',answerType:'scalar',prompt:'Dot product of perpendicular vectors = ?',answer:'0',display:'0',data:{}}; },
        () => { const a=ri(1,5); return {type:'m22_self',answerType:'scalar',prompt:'Dot product of ('+a+','+a+') with itself?',answer:String(2*a*a),display:String(2*a*a),data:{a}}; },
      ],
      medium: [
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m22_eq',answerType:'scalar',prompt:'For ('+a+','+b+')Â·(x,y)=0, what equation describes perpendicular vectors?',answer:a+'x+'+b+'y=0',display:a+'x+'+b+'y=0',data:{a,b}}; },
        () => { const u=[ri(1,4),ri(1,4)],v=[-u[1],u[0]]; return {type:'m22_perpvec',answerType:'scalar',prompt:'A vector perpendicular to '+fv(...u)+' is '+fv(...v)+'? Check dot product.',answer:'0',display:'0 (perpendicular)',data:{u,v}}; },
        () => { return {type:'m22_zero',answerType:'scalar',prompt:'Is the zero vector perpendicular to every vector? (1=yes,0=no)',answer:'1',display:'Yes (trivially)',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,4),b=ri(1,4),c=ri(1,4),d=ri(1,4); return {type:'m22_check',answerType:'scalar',prompt:'('+a+','+b+')Â·('+c+','+d+') = ? Are they perpendicular?',answer:String(a*c+b*d),display:String(a*c+b*d),data:{a,b,c,d}}; },
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m22_dim',answerType:'scalar',prompt:'In R^2, how many linearly independent vectors are perp to ('+a+','+b+')?',answer:'1',display:'1',data:{a,b}}; },
        () => { const u=[ri(1,3),ri(1,3)],v=[ri(1,3),ri(1,3)]; return {type:'m22_angle',answerType:'scalar',prompt:'('+u[0]+','+u[1]+')Â·('+v[0]+','+v[1]+') = '+String(u[0]*v[0]+u[1]*v[1])+'. Perpendicular? (1=yes,0=no)',answer:(u[0]*v[0]+u[1]*v[1]===0)?'1':'0',display:(u[0]*v[0]+u[1]*v[1]===0)?'Yes':'No',data:{u,v}}; },
      ],
    },
    // Mission 23: 3D Perpendicular & Lines
    23: {
      easy: [
        () => { return {type:'m23_plane',answerType:'scalar',prompt:'x+2y+3z=0 defines a _____ through origin in R^3.',answer:'plane',display:'Plane',data:{}}; },
        () => { return {type:'m23_3d',answerType:'scalar',prompt:'Point in R^3 needs ___ coordinates.',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m23_check',answerType:'scalar',prompt:'Does (2,7,3) satisfy x+2y+3z=0? 2+14+9=25. (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
      ],
      medium: [
        () => { return {type:'m23_line',answerType:'scalar',prompt:'How many equations to define a line (not plane) in R^3?',answer:'2',display:'2',data:{}}; },
        () => { const a=ri(1,3),b=ri(1,3),c=ri(1,3); return {type:'m23_normal',answerType:'scalar',prompt:'Plane x+'+a+'y+'+b+'z=0 has normal vector?',answer:'(1,'+a+','+b+')',display:'(1,'+a+','+b+')',data:{a,b,c}}; },
        () => { return {type:'m23_perp2',answerType:'scalar',prompt:'A plane in R^3 is _____-dimensional.',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,3),b=ri(1,3),c=ri(1,3),d=ri(1,3),e=ri(1,3),f=ri(1,3); return {type:'m23_3dot',answerType:'scalar',prompt:'('+a+','+b+','+c+')Â·('+d+','+e+','+f+') = ?',answer:String(a*d+b*e+c*f),display:String(a*d+b*e+c*f),data:{a,b,c,d,e,f}}; },
        () => { const x=ri(1,3),y=ri(1,3),z=ri(1,3); return {type:'m23_check2',answerType:'scalar',prompt:'Does ('+x+','+y+','+z+') satisfy x+2y+3z='+(x+2*y+3*z)+'? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y,z}}; },
        () => { return {type:'m23_3planes',answerType:'scalar',prompt:'3 planes in R^3: each equation removes ___ dimension.',answer:'1',display:'1',data:{}}; },
      ],
    },
    // Mission 24: Span & Null Space (perp set of plane in 3D)
    24: {
      easy: [
        () => { return {type:'m24_free',answerType:'scalar',prompt:'2 equations, 3 unknowns: how many free variables?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m24_null',answerType:'scalar',prompt:'The null space is also called the _____.',answer:'kernel',display:'Kernel',data:{}}; },
        () => { return {type:'m24_perp',answerType:'scalar',prompt:'Null space is perpendicular to which space?',answer:'row space',display:'Row space',data:{}}; },
      ],
      medium: [
        () => { return {type:'m24_direction',answerType:'scalar',prompt:'Null space of a 2-equation system in R^3 is a _____-dimensional object.',answer:'1',display:'1 (a line)',data:{}}; },
        () => { const v=[ri(1,3),ri(1,3),ri(1,3)]; return {type:'m24_span',answerType:'scalar',prompt:'Span of '+fv(...v)+' in R^3 is a _____.',answer:'line',display:'Line',data:{v}}; },
        () => { return {type:'m24_plane',answerType:'scalar',prompt:'Span of 2 independent vectors in R^3 is a _____.',answer:'plane',display:'Plane',data:{}}; },
      ],
      hard: [
        () => { return {type:'m24_rn',answerType:'scalar',prompt:'rank + nullity = number of _____.',answer:'columns',display:'Columns',data:{}}; },
        () => { const r=ri(1,3); return {type:'m24_null_check',answerType:'scalar',prompt:'3 columns, rank '+r+'. Nullity = ?',answer:String(3-r),display:String(3-r),data:{r}}; },
        () => { const r=ri(1,3); return {type:'m24_dim',answerType:'scalar',prompt:'rank '+r+' in R^3. Null space is ___-dimensional.',answer:String(3-r),display:String(3-r)+'D',data:{r}}; },
      ],
    },
    // Mission 25: Matrix Null Space (3x3 singular)
    25: {
      easy: [
        () => { return {type:'m25_rank',answerType:'scalar',prompt:'Rank of [[1,2,3],[4,5,6],[7,8,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m25_sing',answerType:'scalar',prompt:'A 3x3 matrix with rank < 3 is _____.',answer:'singular',display:'Singular',data:{}}; },
        () => { return {type:'m25_det',answerType:'scalar',prompt:'det([[1,2,3],[4,5,6],[7,8,9]]) = ?',answer:'0',display:'0',data:{}}; },
      ],
      medium: [
        () => { return {type:'m25_ns_dir',answerType:'scalar',prompt:'Null space direction of [[1,2,3],[4,5,6],[7,8,9]]?',answer:'(1,-2,1)',display:'(1,-2,1)',data:{}}; },
        () => { return {type:'m25_nullity',answerType:'scalar',prompt:'Rank=2, n=3. Nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m25_perp',answerType:'scalar',prompt:'Null space is perpendicular to every row of the matrix? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { return {type:'m25_check',answerType:'scalar',prompt:'(1,2,3)Â·(1,-2,1) = 1-4+3 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m25_rank_null',answerType:'scalar',prompt:'3x3 rank-2: nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { const r=ri(1,3); return {type:'m25_null_dim',answerType:'scalar',prompt:'3 columns, rank '+r+'. Null space dim = ?',answer:String(3-r),display:String(3-r),data:{r}}; },
      ],
    },
    // Mission 26: Three Subspaces (row, column, null)
    26: {
      easy: [
        () => { const A=[[1,2,3],[4,5,6],[7,8,9]]; return {type:'m26_rank',answerType:'scalar',prompt:'Rank of '+fm2(A)+'... actually this is 3x3. Rank of [[1,2,3],[4,5,6],[7,8,9]]?',answer:'2',display:'2',data:{A}}; },
        () => { return {type:'m26_dim_row',answerType:'scalar',prompt:'Dimension of row space = _____.',answer:'rank',display:'Rank',data:{}}; },
        () => { return {type:'m26_dim_col',answerType:'scalar',prompt:'Dimension of column space = _____.',answer:'rank',display:'Rank',data:{}}; },
      ],
      medium: [
        () => { return {type:'m26_span',answerType:'scalar',prompt:'Row space and null space together span the entire _____.',answer:'input space',display:'Input space (R^n)',data:{}}; },
        () => { return {type:'m26_orthogonal',answerType:'scalar',prompt:'Row space is _____ to null space.',answer:'perpendicular',display:'Perpendicular (orthogonal)',data:{}}; },
        () => { return {type:'m26_dim_sum',answerType:'scalar',prompt:'dim(row space) + dim(null space) = number of _____.',answer:'columns',display:'Columns',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m26_det',answerType:'scalar',prompt:'det('+fm2(A)+') = '+det+'. Rank?',answer:det!==0?'2':'1',display:det!==0?'2':'1',data:{A,det}}; },
        () => { const r=ri(1,3),n=ri(1,3); return {type:'m26_sum',answerType:'scalar',prompt:'rank='+r+', nullity='+n+'. Number of columns = ?',answer:String(r+n),display:String(r+n),data:{r,n}}; },
        () => { return {type:'m26_dim',answerType:'scalar',prompt:'For 2Ã—3 matrix rank 2: row space is ___D, null space is ___D.',answer:'2 and 1',display:'2D and 1D',data:{}}; },
      ],
    },
    // Mission 27: Collapsing Dimension (singular matrix effect)
    27: {
      easy: [
        () => { return {type:'m27_det',answerType:'scalar',prompt:'det([[1,2],[2,4]]) = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m27_rank',answerType:'scalar',prompt:'Rank of [[1,2],[2,4]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m27_collapse',answerType:'scalar',prompt:'A rank-1 matrix collapses 2D to ___D.',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const B=[[1,2],[2,4]]; const x=ri(1,5),y=ri(1,5); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m27_apply',answerType:'scalar',prompt:'Apply B=[[1,2],[2,4]] to ('+x+','+y+'). Result?',answer:fv(...r),display:fv(...r),data:{B,x,y,r}}; },
        () => { return {type:'m27_parallel',answerType:'scalar',prompt:'Does B=[[1,2],[2,4]] map distinct parallel lines to distinct points? (1=yes,0=no)',answer:'0',display:'No - they collapse to same point',data:{}}; },
        () => { return {type:'m27_null_dir',answerType:'scalar',prompt:'Null space direction of [[1,2],[2,4]]?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
      ],
      hard: [
        () => { const k=ri(1,6); return {type:'m27_line_k',answerType:'scalar',prompt:'All points on 2y+x='+k+' map to a single point under B=[[1,2],[2,4]]. What is that point?',answer:'('+k+','+(2*k)+')',display:'('+k+','+(2*k)+')',data:{k}}; },
        () => { const B=[[1,2],[2,4]]; const v=[ri(1,3),ri(1,3)]; const r=[B[0][0]*v[0]+B[0][1]*v[1],B[1][0]*v[0]+B[1][1]*v[1]]; return {type:'m27_result',answerType:'scalar',prompt:'BÂ·('+v[0]+','+v[1]+') = ? where B=[[1,2],[2,4]]',answer:fv(...r),display:fv(...r),data:{B,v,r}}; },
        () => { return {type:'m27_dim_in_out',answerType:'scalar',prompt:'Rank-1 in 2D: 1D input line â†’ ___D output point.',answer:'0',display:'0D (a point)',data:{}}; },
      ],
    },
    // Mission 28: Span Plot 3D (visualize span)
    28: {
      easy: [
        () => { return {type:'m28_plane',answerType:'scalar',prompt:'How many independent vectors span a plane in R^3?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m28_origin',answerType:'scalar',prompt:'Does the origin always belong to any span? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { const v=[ri(1,3),ri(1,3),ri(1,3)]; return {type:'m28_one',answerType:'scalar',prompt:'Span of '+fv(...v)+' in R^3 is a _____.',answer:'line',display:'Line',data:{v}}; },
      ],
      medium: [
        () => { return {type:'m28_scalar',answerType:'scalar',prompt:'If two vectors in R^3 are scalar multiples, their span is a _____.',answer:'line',display:'Line',data:{}}; },
        () => { return {type:'m28_indep',answerType:'scalar',prompt:'2 independent vectors in R^3 span a _____.',answer:'plane',display:'Plane',data:{}}; },
        () => { return {type:'m28_r3',answerType:'scalar',prompt:'To span all of R^3, you need at least ___ independent vectors.',answer:'3',display:'3',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,3),b=ri(1,3); return {type:'m28_dim_check',answerType:'scalar',prompt:'Span of '+a+' vectors in R^'+b+'. Max possible dim?',answer:String(Math.min(a,b)),display:String(Math.min(a,b)),data:{a,b}}; },
        () => { return {type:'m28_3vec',answerType:'scalar',prompt:'3 linearly independent vectors in R^3 span a ___-D object.',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m28_dim_dep',answerType:'scalar',prompt:'If 3 vectors in R^3 are dependent, span dim < ?',answer:'3',display:'3',data:{}}; },
      ],
    },
    // Mission 29: Perpendicular to Plane (null space in 3D)
    29: {
      easy: [
        () => { return {type:'m29_intersect',answerType:'scalar',prompt:'Two planes in R^3 typically intersect in a _____.',answer:'line',display:'Line',data:{}}; },
        () => { return {type:'m29_null',answerType:'scalar',prompt:'The null space is _____ to the plane it derives from.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
        () => { return {type:'m29_3d',answerType:'scalar',prompt:'A plane in R^3 is defined by how many linear equations?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,3),b=ri(1,3),c=ri(1,3); return {type:'m29_normal',answerType:'scalar',prompt:'Plane: '+a+'x+'+b+'y+'+c+'z=0. Normal direction?',answer:'('+a+','+b+','+c+')',display:'('+a+','+b+','+c+')',data:{a,b,c}}; },
        () => { return {type:'m29_ns_line',answerType:'scalar',prompt:'Null space of a 2-equation system in R^3 is a _____.',answer:'line',display:'Line',data:{}}; },
        () => { return {type:'m29_perp',answerType:'scalar',prompt:'Is null space perpendicular to every vector in the plane? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { return {type:'m29_dim',answerType:'scalar',prompt:'2 equations, 3 unknowns, rank 2. Null space dim = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m29_rank_null',answerType:'scalar',prompt:'3 unknowns, nullity 1. Rank = ?',answer:'2',display:'2',data:{}}; },
        () => { const u=[ri(1,3),ri(1,3),ri(1,3)],v=[ri(1,3),ri(1,3),ri(1,3)]; const cp=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]; return {type:'m29_cross',answerType:'scalar',prompt:'('+u.join(',')+')Ã—('+v.join(',')+') first component?',answer:String(cp[0]),display:String(cp[0]),data:{u,v,cp}}; },
      ],
    },
    // Mission 30: Null Space Again (different 3x3 singular)
    30: {
      easy: [
        () => { return {type:'m30_det',answerType:'scalar',prompt:'det([[1,4,7],[2,5,8],[3,6,9]]) = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m30_rank',answerType:'scalar',prompt:'Rank of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m30_ns',answerType:'scalar',prompt:'Null space direction of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'(1,-2,1)',display:'(1,-2,1)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m30_nullity',answerType:'scalar',prompt:'3Ã—3 matrix rank 2. Nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m30_dep',answerType:'scalar',prompt:'Row3 - 2Ã—Row2 + Row1 = 0 means rows are _____.',answer:'linearly dependent',display:'Linearly dependent',data:{}}; },
        () => { return {type:'m30_check',answerType:'scalar',prompt:'Check: (1,4,7)Â·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { const A=[[1,4,7],[2,5,8],[3,6,9]]; return {type:'m30_perp',answerType:'scalar',prompt:'Row (1,4,7)Â·null (1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{A}}; },
        () => { return {type:'m30_indep',answerType:'scalar',prompt:'Row space of [[1,4,7],[2,5,8],[3,6,9]] is spanned by how many vectors?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m30_sum',answerType:'scalar',prompt:'rank + nullity = 2 + 1 = 3 = number of _____.',answer:'columns',display:'Columns',data:{}}; },
      ],
    },
    // Mission 31: Three Spaces Again (Row, Column, Null of A)
    31: {
      easy: [
        () => { return {type:'m31_rank',answerType:'scalar',prompt:'Rank of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m31_nullity',answerType:'scalar',prompt:'Nullity of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m31_same',answerType:'scalar',prompt:'dim(row space) = dim(column space) = ?',answer:'rank',display:'Rank = 2',data:{}}; },
      ],
      medium: [
        () => { return {type:'m31_dim_row',answerType:'scalar',prompt:'Row space of a 3Ã—3 rank-2 matrix is a ___-dimensional subspace of R^3.',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m31_dim_null',answerType:'scalar',prompt:'Null space is ___-dimensional for 3Ã—3 rank-2.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m31_col',answerType:'scalar',prompt:'Column space of a 3Ã—3 rank-2 matrix is a ___-dimensional subspace of R^3.',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { const r=ri(1,3),n=ri(1,3); return {type:'m31_rank_null',answerType:'scalar',prompt:'dim(R)='+r+', dim(N)='+n+'. Number of columns = ?',answer:String(r+n),display:String(r+n),data:{r,n}}; },
        () => { return {type:'m31_count',answerType:'scalar',prompt:'How many fundamental subspaces does every matrix have?',answer:'4',display:'4',data:{}}; },
        () => { const A=[[ri(1,3),ri(1,3)],[ri(1,3),ri(1,3)]]; return {type:'m31_dim_check',answerType:'scalar',prompt:'A 2Ã—2 rank-1 matrix: dim(R)=1, dim(C)=1, dim(N)=1, dim(N^T)=1. Sum input?',answer:'2',display:'2 (R+N)',data:{A}}; },
      ],
    },
    // Mission 32: Check Orthogonality (Fundamental Theorem)
    32: {
      easy: [
        () => { return {type:'m32_dot1',answerType:'scalar',prompt:'(1,4,7)Â·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m32_perp',answerType:'scalar',prompt:'If dot(r,n) = 0, then r and n are _____.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
        () => { return {type:'m32_theorem',answerType:'scalar',prompt:'The Fundamental Theorem says row space is _____ to null space.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
      ],
      medium: [
        () => { return {type:'m32_check2',answerType:'scalar',prompt:'(4,5,6)Â·(1,-2,1) = 4-10+6 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m32_all',answerType:'scalar',prompt:'Every row of A has dot product 0 with every null space vector? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m32_why',answerType:'scalar',prompt:'Why? Because Ax=0 means each rowÂ·x = _____.',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { return {type:'m32_dot',answerType:'scalar',prompt:'(7,8,9)Â·(1,-2,1) = 7-16+9 = ?',answer:'0',display:'0',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m32_sum',answerType:'scalar',prompt:n+'Ã—'+n+' rank '+r+'. dim(R)+dim(N) = '+r+'+'+(n-r)+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { const m=ri(3,5),n=ri(3,5),r=ri(1,Math.min(m,n)); return {type:'m32_sum2',answerType:'scalar',prompt:m+'Ã—'+n+' rank '+r+'. dim(C)+dim(N^T) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{m,n,r}}; },
      ],
    },
    // â•â•â• Module 3 (cont): Collapse series â•â•â•
    // Mission 33: Line to Point (collapse)
    33: {
      easy: [
        () => { return {type:'m33_det',answerType:'scalar',prompt:'det([[1,2],[2,4]]) = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m33_line',answerType:'scalar',prompt:'All points on 2y+x=4 map to one point under B=[[1,2],[2,4]]. What point?',answer:'(4,8)',display:'(4,8)',data:{}}; },
        () => { return {type:'m33_nonsing',answerType:'scalar',prompt:'Does a non-singular matrix collapse lines? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
      ],
      medium: [
        () => { const B=[[1,2],[2,4]]; return {type:'m33_apply',answerType:'scalar',prompt:'BÂ·(0,2) = ? (point on line 2y+x=4)',answer:'(4,8)',display:'(4,8)',data:{B}}; },
        () => { return {type:'m33_all_same',answerType:'scalar',prompt:'Why do ALL points on 2y+x=4 map to (4,8)?',answer:'null space direction is on the line',display:'Line is parallel to null space',data:{}}; },
        () => { return {type:'m33_range',answerType:'scalar',prompt:'The output (4,8) lies in the _____ of B.',answer:'range',display:'Range',data:{}}; },
      ],
      hard: [
        () => { const k=ri(1,5); const pts=[[k,0],[0,k/2]]; return {type:'m33_intercept',answerType:'scalar',prompt:'Line 2y+x='+k+'. x-intercept + y-intercept = ?',answer:String(k+Math.round(k/2*100)/100),display:String(k+k/2),data:{k}}; },
        () => { const B=[[1,2],[2,4]]; const x=ri(1,3),y=ri(1,3); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m33_apply',answerType:'scalar',prompt:'B=[[1,2],[2,4]], ('+x+','+y+'). Bv = ?',answer:fv(...r),display:fv(...r),data:{B,x,y,r}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m33_rank',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. Rank = ?',answer:'1',display:'1',data:{B}}; },
      ],
    },
    // Mission 34: Many Lines Collapse
    34: {
      easy: [
        () => { return {type:'m34_k10',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. Line 2y+x=10 maps to which point?',answer:'(10,20)',display:'(10,20)',data:{}}; },
        () => { return {type:'m34_k62',answerType:'scalar',prompt:'Line 2y+x=62 maps to which point under B=[[1,2],[2,4]]?',answer:'(62,124)',display:'(62,124)',data:{}}; },
        () => { return {type:'m34_diff',answerType:'scalar',prompt:'Do different k values give different output points? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const k=ri(1,10); return {type:'m34_formula',answerType:'scalar',prompt:'Line 2y+x='+k+' maps to point?',answer:'('+k+','+(2*k)+')',display:'('+k+','+(2*k)+')',data:{k}}; },
        () => { return {type:'m34_pattern',answerType:'scalar',prompt:'Pattern: k maps to (k, 2k). What is the range direction?',answer:'(1,2)',display:'(1,2)',data:{}}; },
        () => { return {type:'m34_parallel',answerType:'scalar',prompt:'Each parallel line maps to a _____ output point.',answer:'different',display:'Different',data:{}}; },
      ],
      hard: [
        () => { const B=[[1,2],[2,4]]; const x=ri(1,3),y=ri(1,3); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m34_apply',answerType:'scalar',prompt:'B=[[1,2],[2,4]], v=('+x+','+y+'). Bv = ?',answer:fv(...r),display:fv(...r),data:{B,x,y,r}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m34_rank',answerType:'scalar',prompt:'Range of B=[[1,2],[2,4]]: dim = ?',answer:'1',display:'1',data:{B}}; },
        () => { const x=ri(1,3),y=ri(1,3); return {type:'m34_check',answerType:'scalar',prompt:'(1,2)Â·('+x+','+y+') = '+(x+2*y)+'. Is this in range? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y}}; },
      ],
    },
    // Mission 35: General Collapse Formula
    35: {
      easy: [
        () => { return {type:'m35_ns',answerType:'scalar',prompt:'Null space direction of [[1,2],[2,4]]?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m35_range',answerType:'scalar',prompt:'Range direction of [[1,2],[2,4]]?',answer:'(1,2)',display:'(1,2)',data:{}}; },
        () => { return {type:'m35_perp',answerType:'scalar',prompt:'Are null space and range perpendicular? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const k=ri(1,8); return {type:'m35_formula',answerType:'scalar',prompt:'B maps 2y+x='+k+' to which point?',answer:'('+k+','+(2*k)+')',display:'('+k+','+(2*k)+')',data:{k}}; },
        () => { return {type:'m35_ns_range',answerType:'scalar',prompt:'(-2,1)Â·(1,2) = -2+2 = ? Confirms perpendicularity.',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m35_collapse',answerType:'scalar',prompt:'General formula: B maps 2y+x=k to (k, ___).',answer:String(2),display:'2k',data:{}}; },
      ],
      hard: [
        () => { const B=[[1,2],[2,4]]; const x=ri(1,5),y=ri(1,5); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m35_output',answerType:'scalar',prompt:'B=[[1,2],[2,4]], v=('+x+','+y+'). Second component of Bv?',answer:String(r[1]),display:String(r[1]),data:{B,x,y,r}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m35_rank1',answerType:'scalar',prompt:'B=[[1,2],[2,4]] has rank = ?',answer:'1',display:'1',data:{B}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m35_det',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. det(B) = ?',answer:'0',display:'0',data:{B}}; },
      ],
    },
    // Mission 36: Dimension Collapse (2D â†’ 1D)
    36: {
      easy: [
        () => { return {type:'m36_rank',answerType:'scalar',prompt:'Rank of [[1,2],[2,4]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m36_nullity',answerType:'scalar',prompt:'Nullity of [[1,2],[2,4]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m36_sum',answerType:'scalar',prompt:'rank + nullity = 1 + 1 = ?',answer:'2',display:'2 (number of columns)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m36_ftoc',answerType:'scalar',prompt:'rank + nullity always equals number of _____.',answer:'columns',display:'Columns',data:{}}; },
        () => { return {type:'m36_dim_in',answerType:'scalar',prompt:'2D input, rank 1. How many dimensions lost?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m36_dim_out',answerType:'scalar',prompt:'2D input, rank 1. Output is ___-dimensional.',answer:'1',display:'1',data:{}}; },
      ],
      hard: [
        () => { const n=ri(2,5),r=ri(1,n-1); return {type:'m36_general',answerType:'scalar',prompt:n+'Ã—'+n+' matrix, rank '+r+'. Nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
        () => { return {type:'m36_identity',answerType:'scalar',prompt:'Identity 2Ã—2: rank=2, nullity=0. Dimensions lost?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m36_zero',answerType:'scalar',prompt:'Zero 2Ã—2 matrix: rank=0, nullity=2. Dimensions lost?',answer:'2',display:'2 (all collapsed)',data:{}}; },
      ],
    },
    // â•â•â• Module 4: Fundamental Theorem â•â•â•
    // Mission 37: Four Subspaces Intro (rank-1 visual)
    37: {
      easy: [
        () => { return {type:'m37_rank',answerType:'scalar',prompt:'Rank of [[1,2],[3,6]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m37_row_dir',answerType:'scalar',prompt:'Row space direction of [[1,2],[3,6]]?',answer:'(1,2)',display:'(1,2)',data:{}}; },
        () => { return {type:'m37_col_dir',answerType:'scalar',prompt:'Column space direction of [[1,2],[3,6]]?',answer:'(1,3)',display:'(1,3)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m37_null_dir',answerType:'scalar',prompt:'Null space direction of [[1,2],[3,6]]?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m37_all_1d',answerType:'scalar',prompt:'For rank-1 2Ã—2 matrix, are all 3 subspaces 1D lines? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m37_dim_sum',answerType:'scalar',prompt:'dim(row) + dim(null) = 1 + 1 = ?',answer:'2',display:'2 (columns)',data:{}}; },
      ],
      hard: [
        () => { return {type:'m37_verify',answerType:'scalar',prompt:'(1,2)Â·(-2,1) = -2+2 = ?. Row âŠ¥ null confirmed.',answer:'0',display:'0',data:{}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m37_det_check',answerType:'scalar',prompt:'det('+fm2(A)+')='+det+'. Is this matrix rank-2?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m37_dim_check',answerType:'scalar',prompt:'For [[1,2],[3,6]]: rank=1, nullity=1. Sum = ?',answer:'2',display:'2 (number of columns)',data:{}}; },
      ],
    },
    // Mission 38: Row Space perp Null Space (verify)
    38: {
      easy: [
        () => { return {type:'m38_dot',answerType:'scalar',prompt:'(1,3)Â·(-3,1) = -3+3 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m38_perp',answerType:'scalar',prompt:'R(M) and N(M) are always _____ subspaces.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
        () => { return {type:'m38_zero',answerType:'scalar',prompt:'Is zero vector in both R(M) and N(M)? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const M=[[1,2],[3,6]]; return {type:'m38_row',answerType:'scalar',prompt:'Row space of M=[[1,2],[3,6]] is span of?',answer:'(1,2)',display:'(1,2)',data:{M}}; },
        () => { return {type:'m38_null',answerType:'scalar',prompt:'Null space of M=[[1,2],[3,6]] is span of?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m38_sum',answerType:'scalar',prompt:'dim(R) + dim(N) = 1 + 1 = number of _____',answer:'columns',display:'Columns = 2',data:{}}; },
      ],
      hard: [
        () => { const M=[[1,2],[3,6]]; const x=ri(1,3),y=ri(1,3); const row=M[0]; return {type:'m38_verify_any',answerType:'scalar',prompt:'Row (1,2)Â·('+x+',-'+(2*x)+') = '+x+'+'+(-2*x)+' = ?',answer:'0',display:'0',data:{x,M}}; },
        () => { const n=ri(2,5),r=ri(1,n); return {type:'m38_sum_check',answerType:'scalar',prompt:n+'Ã—'+n+' matrix rank '+r+'. dim(R)+dim(N) = '+r+'+'+(n-r)+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { return {type:'m38_which',answerType:'scalar',prompt:'Row space âŠ¥ null space lives in R^___ for 3Ã—3 matrix.',answer:'3',display:'3 (input space)',data:{}}; },
      ],
    },
    // Mission 39: Null Space of M and M^T
    39: {
      easy: [
        () => { return {type:'m39_nm',answerType:'scalar',prompt:'N(M) for M=[[1,2],[3,6]] is span of?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m39_nmt',answerType:'scalar',prompt:'N(M^T) for M=[[1,2],[3,6]] is span of?',answer:'(-3,1)',display:'(-3,1)',data:{}}; },
        () => { return {type:'m39_diff',answerType:'scalar',prompt:'N(M) and N(M^T) live in _____ spaces.',answer:'different',display:'Different (R^n vs R^m)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m39_perp_cm',answerType:'scalar',prompt:'N(M^T) is perpendicular to which space?',answer:'column space',display:'Column space C(M)',data:{}}; },
        () => { return {type:'m39_dim_nm',answerType:'scalar',prompt:'dim(N(M)) for 2Ã—2 rank-1 matrix?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m39_dim_nmt',answerType:'scalar',prompt:'dim(N(M^T)) for 2Ã—2 rank-1 matrix?',answer:'1',display:'1',data:{}}; },
      ],
      hard: [
        () => { const M=[[1,2],[3,6]]; const c=[M[0][0],M[1][0]]; const n=[-3,1]; return {type:'m39_verify',answerType:'scalar',prompt:'Column (1,3)Â·(-3,1) = '+(-3)+'+'+3+' = ?',answer:'0',display:'0 (column âŠ¥ left null)',data:{M,c,n}}; },
        () => { const n=ri(2,5),r=ri(1,n); const m=ri(2,5); return {type:'m39_dim_check',answerType:'scalar',prompt:n+'Ã—'+m+' matrix rank '+r+'. dim(N^T)+dim(C) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{n,m,r}}; },
        () => { return {type:'m39_dim_nm',answerType:'scalar',prompt:'dim(N(M)) for 3Ã—3 rank-1 matrix?',answer:'2',display:'2',data:{}}; },
      ],
    },
    // Mission 40: Orthogonal Subspaces (verify all pairs)
    40: {
      easy: [
        () => { return {type:'m40_c_perp',answerType:'scalar',prompt:'C(M) is perpendicular to _____.',answer:'N(M^T)',display:'N(M^T)',data:{}}; },
        () => { return {type:'m40_r_perp',answerType:'scalar',prompt:'R(M) is perpendicular to _____.',answer:'N(M)',display:'N(M)',data:{}}; },
        () => { return {type:'m40_pairs',answerType:'scalar',prompt:'How many orthogonal pairs do the 4 subspaces form?',answer:'2',display:'2',data:{}}; },
      ],
      medium: [
        () => { return {type:'m40_input',answerType:'scalar',prompt:'R(A) and N(A) both live in the _____ space.',answer:'input',display:'Input space R^n',data:{}}; },
        () => { return {type:'m40_output',answerType:'scalar',prompt:'C(A) and N(A^T) both live in the _____ space.',answer:'output',display:'Output space R^m',data:{}}; },
        () => { return {type:'m40_four',answerType:'scalar',prompt:'Name all 4 fundamental subspaces.',answer:'R(A),N(A),C(A),N(A^T)',display:'Row, Null, Col, Left Null',data:{}}; },
      ],
      hard: [
        () => { const m=ri(2,4),n=ri(2,4),r=ri(1,Math.min(m,n)); return {type:'m40_dim_check',answerType:'scalar',prompt:m+'Ã—'+n+' matrix rank '+r+'. dim(R)+dim(N) = '+(n-r)+'+'+r+' = ?',answer:String(n),display:String(n),data:{m,n,r}}; },
        () => { const m=ri(2,4),n=ri(2,4),r=ri(1,Math.min(m,n)); return {type:'m40_dim_check2',answerType:'scalar',prompt:m+'Ã—'+n+' matrix rank '+r+'. dim(C)+dim(N^T) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{m,n,r}}; },
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; const r=det!==0?2:1; return {type:'m40_dim_sum',answerType:'scalar',prompt:'Rank-'+r+' 2Ã—2 matrix: dim(R)+dim(N) = '+r+'+'+(2-r)+' = ?',answer:'2',display:'2',data:{A,r}}; },
      ],
    },
    // Mission 41: All Four of A (3Ã—3 rank-2)
    41: {
      easy: [
        () => { return {type:'m41_rank',answerType:'scalar',prompt:'Rank of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m41_ns',answerType:'scalar',prompt:'N(A) direction of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'(1,-2,1)',display:'(1,-2,1)',data:{}}; },
        () => { return {type:'m41_dim_r',answerType:'scalar',prompt:'dim(R(A)) for rank-2 3Ã—3 matrix?',answer:'2',display:'2',data:{}}; },
      ],
      medium: [
        () => { return {type:'m41_subspaces',answerType:'scalar',prompt:'For 3Ã—3 rank-2: R(A) is ___D, N(A) is ___D.',answer:'2 and 1',display:'2D and 1D',data:{}}; },
        () => { return {type:'m41_col',answerType:'scalar',prompt:'C(A) for rank-2 3Ã—3 is a ___-dimensional plane in R^3.',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m41_lns',answerType:'scalar',prompt:'N(A^T) for rank-2 3Ã—3 is ___-dimensional.',answer:'1',display:'1',data:{}}; },
      ],
      hard: [
        () => { return {type:'m41_types',answerType:'scalar',prompt:'3Ã—3 rank-2: R=2D, N=1D. C=2D, N^T=1D. dim(R)+dim(N)=?',answer:'3',display:'3',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m41_sum',answerType:'scalar',prompt:n+'Ã—'+n+' rank '+r+'. dim(R)+dim(N) = '+r+'+'+(n-r)+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { return {type:'m41_verify',answerType:'scalar',prompt:'(1,4,7)Â·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
      ],
    },
    // Mission 42: Rank by Example (4Ã—4 matrices)
    42: {
      easy: [
        () => { return {type:'m42_i4',answerType:'scalar',prompt:'Rank of 4Ã—4 identity matrix?',answer:'4',display:'4',data:{}}; },
        () => { return {type:'m42_zero',answerType:'scalar',prompt:'Rank of 4Ã—4 zero matrix?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m42_max',answerType:'scalar',prompt:'Maximum rank of 4Ã—4 matrix?',answer:'4',display:'4',data:{}}; },
      ],
      medium: [
        () => { const r=ri(0,4); return {type:'m42_range',answerType:'scalar',prompt:'Rank of a matrix equals the dimension of its _____.',answer:'range',display:'Range (column space)',data:{r}}; },
        () => { return {type:'m42_rank1',answerType:'scalar',prompt:'Rank-1 4Ã—4 matrix: column space is ___-dimensional.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m42_rank2',answerType:'scalar',prompt:'Rank-2 4Ã—4 matrix: nullity = ?',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { const r=ri(1,4); return {type:'m42_nullity',answerType:'scalar',prompt:'4Ã—4 matrix rank '+r+'. Nullity = ?',answer:String(4-r),display:String(4-r),data:{r}}; },
        () => { return {type:'m42_rank3',answerType:'scalar',prompt:'Rank-3 4Ã—4: R(A) is ___D, N(A) is ___D.',answer:'3 and 1',display:'3D and 1D',data:{}}; },
        () => { return {type:'m42_equiv',answerType:'scalar',prompt:'rank(A) = rank(A^T)? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
    },
    // Mission 43: Range Contains Line
    43: {
      easy: [
        () => { return {type:'m43_line',answerType:'scalar',prompt:'If v is in range of A, is 5v also in range? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m43_subspace',answerType:'scalar',prompt:'The range of a linear map is always a _____.',answer:'subspace',display:'Subspace',data:{}}; },
        () => { return {type:'m43_closed',answerType:'scalar',prompt:'A subspace must be closed under addition and _____.',answer:'scaling',display:'Scaling',data:{}}; },
      ],
      medium: [
        () => { return {type:'m43_prop',answerType:'scalar',prompt:'Which property guarantees A(ax) = aA(x)?',answer:'linearity',display:'Linearity (homogeneity)',data:{}}; },
        () => { return {type:'m43_line_in',answerType:'scalar',prompt:'If v is in range, the entire line tv (for all t) is in _____.',answer:'range',display:'Range',data:{}}; },
        () => { return {type:'m43_zero',answerType:'scalar',prompt:'Zero vector is always in the range of a linear map? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { const A=[[1,0],[0,1]]; return {type:'m43_rank',answerType:'scalar',prompt:'Rank of identity I_2 = ?. dim(range)?',answer:'2',display:'2',data:{A}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m43_rank_check',answerType:'scalar',prompt:'Range of [[1,2],[2,4]]: dimension = ?',answer:'1',display:'1',data:{A}}; },
        () => { return {type:'m43_prop',answerType:'scalar',prompt:'Which property: A(x+y) = A(x)+A(y)?',answer:'additivity',display:'Additivity',data:{}}; },
      ],
    },
    // Mission 44: Range Contains Span
    44: {
      easy: [
        () => { return {type:'m44_add',answerType:'scalar',prompt:'If v,w are in range of A, is v+w in range? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m44_span2',answerType:'scalar',prompt:'Span of 2 linearly independent vectors in R^3 is a _____.',answer:'plane',display:'Plane',data:{}}; },
        () => { return {type:'m44_closure',answerType:'scalar',prompt:'Range is closed under both addition and _____.',answer:'scaling',display:'Scaling',data:{}}; },
      ],
      medium: [
        () => { return {type:'m44_prop',answerType:'scalar',prompt:'Which property: A(x+y) = A(x)+A(y)?',answer:'additivity',display:'Additivity',data:{}}; },
        () => { return {type:'m44_span_range',answerType:'scalar',prompt:'The span of vectors in the range is also in the _____.',answer:'range',display:'Range',data:{}}; },
        () => { return {type:'m44_col',answerType:'scalar',prompt:'The range equals the _____ space of A.',answer:'column',display:'Column space',data:{}}; },
      ],
      hard: [
        () => { const A=[[1,2],[3,4]]; return {type:'m44_dim',answerType:'scalar',prompt:'Rank of '+fm2(A)+' = ?. dim(range)?',answer:'2',display:'2',data:{A}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m44_dim_range',answerType:'scalar',prompt:'Range of [[1,2],[2,4]] is a ___-dimensional object.',answer:'1',display:'1 (a line)',data:{A}}; },
        () => { return {type:'m44_sub',answerType:'scalar',prompt:'The range of a 3Ã—2 matrix is a subspace of R^___',answer:'3',display:'3 (output space)',data:{}}; },
      ],
    },
    // Mission 45: Dimension Observation
    45: {
      easy: [
        () => { return {type:'m45_dep',answerType:'scalar',prompt:'Are (1,2,3) and (2,4,6) linearly independent? (1=yes,0=no)',answer:'0',display:'No (scalar multiples)',data:{}}; },
        () => { return {type:'m45_indep',answerType:'scalar',prompt:'Are (1,0,0) and (0,1,0) linearly independent? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m45_dim_dep',answerType:'scalar',prompt:'Span of 2 dependent vectors has dimension = ?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { return {type:'m45_span',answerType:'scalar',prompt:'(1,2,3) and (2,4,6) span a ___-dimensional object.',answer:'1',display:'1 (a line)',data:{}}; },
        () => { return {type:'m45_indep2',answerType:'scalar',prompt:'(1,0,0) and (0,1,0) span a ___-dimensional object.',answer:'2',display:'2 (a plane)',data:{}}; },
        () => { return {type:'m45_dim',answerType:'scalar',prompt:'Dimension of span = number of _____ vectors.',answer:'linearly independent',display:'Linearly independent',data:{}}; },
      ],
      hard: [
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m45_rank',answerType:'scalar',prompt:n+' vectors in R^'+n+', '+r+' independent. dim(span) = ?',answer:String(r),display:String(r),data:{n,r}}; },
        () => { return {type:'m45_three',answerType:'scalar',prompt:'(1,0,0),(0,1,0),(0,0,1) span R^3. dim = ?',answer:'3',display:'3',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n-1); return {type:'m45_nullity',answerType:'scalar',prompt:n+' vectors in R^'+n+', dim(span)='+r+'. Nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
      ],
    },
    // â•â•â• Module 5: Capstone Review â•â•â•
    // Mission 46: The Big Picture (complete map)
    46: {
      easy: [
        () => { return {type:'m46_rn',answerType:'scalar',prompt:'R(A) and N(A) live in R^___',answer:'n',display:'n (input space)',data:{}}; },
        () => { return {type:'m46_cm',answerType:'scalar',prompt:'C(A) and N(A^T) live in R^___',answer:'m',display:'m (output space)',data:{}}; },
        () => { return {type:'m46_four',answerType:'scalar',prompt:'A matrix defines how many fundamental subspaces?',answer:'4',display:'4',data:{}}; },
      ],
      medium: [
        () => { return {type:'m46_rn_span',answerType:'scalar',prompt:'Do R(A) and N(A) together span all of R^n? (1=yes,0=no)',answer:'1',display:'Yes (direct sum)',data:{}}; },
        () => { return {type:'m46_perp_pairs',answerType:'scalar',prompt:'Name the two orthogonal pairs.',answer:'RâŠ¥N and CâŠ¥N^T',display:'R(A)âŠ¥N(A) and C(A)âŠ¥N(A^T)',data:{}}; },
        () => { return {type:'m46_dims',answerType:'scalar',prompt:'dim(R)+dim(N) = n. dim(C)+dim(N^T) = ___',answer:'m',display:'m',data:{}}; },
      ],
      hard: [
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m46_calc',answerType:'scalar',prompt:n+'Ã—'+n+' matrix rank '+r+'. dim(R)= '+r+', dim(N)= '+(n-r)+'. Sum?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { const m=ri(2,4),n=ri(2,4),r=ri(1,Math.min(m,n)); return {type:'m46_calc2',answerType:'scalar',prompt:m+'Ã—'+n+' matrix rank '+r+'. dim(C)+dim(N^T) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{m,n,r}}; },
        () => { return {type:'m46_zero',answerType:'scalar',prompt:'If rank=n (full rank), nullity = ?',answer:'0',display:'0',data:{}}; },
      ],
    },
    // Mission 47: Orthogonality Checkup
    47: {
      easy: [
        () => { return {type:'m47_dot1',answerType:'scalar',prompt:'(1,4,7)Â·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m47_dot2',answerType:'scalar',prompt:'(4,5,6)Â·(1,-2,1) = 4-10+6 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m47_confirm',answerType:'scalar',prompt:'Both dot products = 0 confirms row space âŠ¥ _____.',answer:'null space',display:'Null space',data:{}}; },
      ],
      medium: [
        () => { return {type:'m47_always',answerType:'scalar',prompt:'Are these two orthogonal pairs always true for any matrix? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m47_rows',answerType:'scalar',prompt:'The rows of A are vectors in R^___',answer:'n',display:'n',data:{}}; },
        () => { return {type:'m47_null',answerType:'scalar',prompt:'The null space vectors satisfy Ax=0, meaning each rowÂ·x = _____.',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { return {type:'m47_dim_check',answerType:'scalar',prompt:'3Ã—3 rank-2: dim(R)=2, dim(N)=1. Sum = ?',answer:'3',display:'3 (columns)',data:{}}; },
        () => { return {type:'m47_dim_check2',answerType:'scalar',prompt:'3Ã—3 rank-2: dim(C)=2, dim(N^T)=1. Sum = ?',answer:'3',display:'3 (rows)',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m47_check',answerType:'scalar',prompt:n+'Ã—'+n+' rank '+r+'. Verify: dim(R)+dim(N) = '+(n-r)+'+'+r+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
      ],
    },
    // Mission 48: Rank-Nullity Review
    48: {
      easy: [
        () => { return {type:'m48_fn',answerType:'scalar',prompt:'rank + nullity = number of _____',answer:'columns',display:'Columns (n)',data:{}}; },
        () => { return {type:'m48_b',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. rank=1, nullity=1. rank+nullity=?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m48_check',answerType:'scalar',prompt:'Does rank+nullity always equal number of columns? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const n=ri(2,5),r=ri(1,n); return {type:'m48_calc',answerType:'scalar',prompt:n+'Ã—'+n+' matrix, rank='+r+'. Nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
        () => { return {type:'m48_rank2',answerType:'scalar',prompt:'4Ã—4 matrix, rank=2. nullity=___',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m48_rank0',answerType:'scalar',prompt:'nÃ—n zero matrix: rank=0, nullity=___',answer:String(ri(2,5)),display:'n',data:{}}; },
      ],
      hard: [
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m48_calc',answerType:'scalar',prompt:n+'Ã—'+n+' matrix rank '+r+'. nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
        () => { const n=ri(3,5); return {type:'m48_full',answerType:'scalar',prompt:n+'Ã—'+n+' full rank. nullity = ?',answer:'0',display:'0',data:{n}}; },
        () => { return {type:'m48_zero',answerType:'scalar',prompt:'3Ã—3 zero matrix: rank=0, nullity = ?',answer:'3',display:'3',data:{}}; },
      ],
    },
    // Mission 49: Capstone Challenge
    49: {
      easy: [
        () => { return {type:'m49_rank',answerType:'scalar',prompt:'Rank of a 3Ã—2 matrix with all rows collinear?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m49_rm',answerType:'scalar',prompt:'R(M) for 3Ã—2 rank-1 lives in R^___',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m49_cm',answerType:'scalar',prompt:'C(M) for 3Ã—2 rank-1 is a line in R^___',answer:'3',display:'3',data:{}}; },
      ],
      medium: [
        () => { return {type:'m49_dim_r',answerType:'scalar',prompt:'dim(R(M)) + dim(N(M)) = number of columns = ?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m49_dim_c',answerType:'scalar',prompt:'dim(C(M)) + dim(N(M^T)) = number of rows = ?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m49_subspaces',answerType:'scalar',prompt:'For 3Ã—2 rank-1: R is 1D, N is 1D, C is 1D, N^T is ___D.',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { return {type:'m49_perp1',answerType:'scalar',prompt:'R(M) âŠ¥ N(M): 1D line âŠ¥ 1D line in R^2. They fill R^2? (1=yes,0=no)',answer:'1',display:'Yes (direct sum)',data:{}}; },
        () => { return {type:'m49_perp2',answerType:'scalar',prompt:'C(M) âŠ¥ N(M^T): 1D âŠ¥ 2D in R^3. They fill R^3? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m49_summary',answerType:'scalar',prompt:'All 4 subspaces are either 1D lines or ___-dimensional.',answer:'2',display:'2',data:{}}; },
      ],
    },
    // Mission 50: Wisdom Achieved (summary)
    50: {
      easy: [
        () => { return {type:'m50_four',answerType:'scalar',prompt:'How many fundamental subspaces does a matrix define?',answer:'4',display:'4',data:{}}; },
        () => { return {type:'m50_rank',answerType:'scalar',prompt:'dim(C(A)) = _____.',answer:'rank',display:'Rank',data:{}}; },
        () => { return {type:'m50_done',answerType:'scalar',prompt:'Have you achieved Linear Algebra wisdom? (1=yes,0=no)',answer:'1',display:'Yes!',data:{}}; },
      ],
      medium: [
        () => { return {type:'m50_pairs',answerType:'scalar',prompt:'Name the two orthogonal complement pairs.',answer:'RâŠ¥N, CâŠ¥N^T',display:'R(A)âŠ¥N(A) and C(A)âŠ¥N(A^T)',data:{}}; },
        () => { return {type:'m50_ftn',answerType:'scalar',prompt:'rank + nullity = n is the _____ Theorem.',answer:'Rank-Nullity',display:'Rank-Nullity',data:{}}; },
        () => { return {type:'m50_direct',answerType:'scalar',prompt:'R âŠ• N = R^n means they form a _____ sum.',answer:'direct',display:'Direct sum',data:{}}; },
      ],
      hard: [
        () => { return {type:'m50_rank_nullity',answerType:'scalar',prompt:'3Ã—3 matrix rank 2. nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m50_dim_check',answerType:'scalar',prompt:'4Ã—4 matrix rank 3. dim(N) = ?',answer:'1',display:'1',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m50_all_dims',answerType:'scalar',prompt:n+'Ã—'+n+' rank '+r+': dim(R)='+r+', dim(N)='+(n-r)+', dim(C)='+r+', dim(N^T)='+(n-r)+'. Input dims?',answer:String(n),display:String(n),data:{n,r}}; },
      ],
    },
    // â•â•â• Module 6: Real-World Applications â•â•â•
    // Mission 51: User-Item Matrix (recommendations)
    51: {
      easy: [
        () => { return {type:'m51_maxrank',answerType:'scalar',prompt:'Max rank of a 3Ã—4 matrix?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m51_rank',answerType:'scalar',prompt:'Rank measures how many _____ patterns exist in data.',answer:'independent',display:'Independent',data:{}}; },
        () => { return {type:'m51_lowrank',answerType:'scalar',prompt:'Low rank means many users have _____ preferences.',answer:'similar',display:'Similar',data:{}}; },
      ],
      medium: [
        () => { return {type:'m51_users',answerType:'scalar',prompt:'If rank < num users, what does that mean about user preferences?',answer:'correlated',display:'Correlated / similar patterns',data:{}}; },
        () => { return {type:'m51_factor',answerType:'scalar',prompt:'Low-rank approximation is the basis of matrix _____.',answer:'factorization',display:'Factorization',data:{}}; },
        () => { return {type:'m51_compress',answerType:'scalar',prompt:'A 1000Ã—5000 rating matrix with rank 10 can be compressed significantly? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { const m=ri(2,5),n=ri(2,5); return {type:'m51_maxrank',answerType:'scalar',prompt:m+'Ã—'+n+' rating matrix. Max rank?',answer:String(Math.min(m,n)),display:String(Math.min(m,n)),data:{m,n}}; },
        () => { const r=ri(1,3),m=ri(r+1,r+3),n=ri(r+1,r+3); const full=m*n; const low=r*(m+n); return {type:'m51_compress',answerType:'scalar',prompt:m+'Ã—'+n+' rank-'+r+'. Full storage='+full+', low-rank='+low+'. Saved?',answer:String(full-low),display:String(full-low)+' entries',data:{m,n,r,full,low}}; },
        () => { return {type:'m51_rank_low',answerType:'scalar',prompt:'100Ã—500 matrix rank 5. Elements = 50000. Low-rank needs ___ params.',answer:String(5*(100+500)),display:String(5*(100+500)),data:{}}; },
      ],
    },
    // Mission 52: Collaborative Filtering
    52: {
      easy: [
        () => { return {type:'m52_dot',answerType:'scalar',prompt:'Dot product measures _____ between two vectors.',answer:'similarity',display:'Similarity',data:{}}; },
        () => { return {type:'m52_zero',answerType:'scalar',prompt:'If dot(u,v)=0, are users similar? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
        () => { return {type:'m52_method',answerType:'scalar',prompt:'Collaborative filtering recommends based on similar _____.',answer:'users',display:'Users',data:{}}; },
      ],
      medium: [
        () => { const u=[ri(1,5),ri(1,5)],v=[ri(1,5),ri(1,5)]; return {type:'m52_calc',answerType:'scalar',prompt:'Dot product of '+fv(...u)+' and '+fv(...v)+'?',answer:String(u[0]*v[0]+u[1]*v[1]),display:String(u[0]*v[0]+u[1]*v[1]),data:{u,v}}; },
        () => { return {type:'m52_cosine',answerType:'scalar',prompt:'Cosine similarity normalizes the dot product by the product of _____.',answer:'magnitudes',display:'Magnitudes (lengths)',data:{}}; },
        () => { return {type:'m52_predict',answerType:'scalar',prompt:'To predict a missing rating, use dot product with similar _____.',answer:'users',display:'Users',data:{}}; },
      ],
      hard: [
        () => { const u=[ri(1,5),ri(1,5)],v=[ri(1,5),ri(1,5)]; const dot=u[0]*v[0]+u[1]*v[1]; const mU=Math.sqrt(u[0]*u[0]+u[1]*u[1]),mV=Math.sqrt(v[0]*v[0]+v[1]*v[1]); return {type:'m52_cos',answerType:'scalar',prompt:'Cosine sim of '+fv(...u)+' and '+fv(...v)+'?',answer:String(rnd2(dot/(mU*mV))),display:String(rnd2(dot/(mU*mV))),data:{u,v}}; },
        () => { const u=[ri(1,5),ri(1,5)],v=[ri(1,5),ri(1,5)]; const dot=u[0]*v[0]+u[1]*v[1]; return {type:'m52_dot_calc',answerType:'scalar',prompt:'Dot product of '+fv(...u)+' and '+fv(...v)+'?',answer:String(dot),display:String(dot),data:{u,v}}; },
        () => { const users=ri(3,6),items=ri(3,6); return {type:'m52_matrix',answerType:'scalar',prompt:users+' users, '+items+' items. Rating matrix size?',answer:users+'x'+items,display:users+'Ã—'+items,data:{users,items}}; },
      ],
    },
    // Mission 53: Web as a Graph (PageRank)
    53: {
      easy: [
        () => { return {type:'m53_links',answerType:'scalar',prompt:'In PageRank, incoming links from important pages give more _____.',answer:'rank',display:'Rank / importance',data:{}}; },
        () => { return {type:'m53_eigen',answerType:'scalar',prompt:'PageRank solves the _____ eigenvector problem.',answer:'dominant',display:'Dominant',data:{}}; },
        () => { return {type:'m53_sparse',answerType:'scalar',prompt:'Web graph adjacency matrix is usually _____.',answer:'sparse',display:'Sparse',data:{}}; },
      ],
      medium: [
        () => { return {type:'m53_markov',answerType:'scalar',prompt:'PageRank models the web as a _____ chain.',answer:'Markov',display:'Markov chain',data:{}}; },
        () => { return {type:'m53_damping',answerType:'scalar',prompt:'The damping factor d represents probability of following a _____',answer:'link',display:'Link (vs random jump)',data:{}}; },
        () => { return {type:'m53_steady',answerType:'scalar',prompt:'PageRank is the steady-state _____ of the web transition matrix.',answer:'distribution',display:'Distribution',data:{}}; },
      ],
      hard: [
        () => { return {type:'m53_two_step',answerType:'scalar',prompt:'If damping factor d=0.85, probability of random jump = ?',answer:'0.15',display:'0.15',data:{}}; },
        () => { return {type:'m53_markov',answerType:'scalar',prompt:'A 4-page web: transition matrix is ___Ã—___.',answer:'4Ã—4',display:'4Ã—4',data:{}}; },
        () => { return {type:'m53_eigenvalue',answerType:'scalar',prompt:'PageRank steady state: the dominant eigenvalue of P is _____.',answer:'1',display:'1',data:{}}; },
      ],
    },
    // Mission 54: Power Method
    54: {
      easy: [
        () => { return {type:'m54_converge',answerType:'scalar',prompt:'Power method converges to the _____ eigenvector.',answer:'dominant',display:'Dominant (largest eigenvalue)',data:{}}; },
        () => { return {type:'m54_iterate',answerType:'scalar',prompt:'Power method computes v_{k+1} = AÂ·v_k, then _____.',answer:'normalize',display:'Normalize',data:{}}; },
        () => { return {type:'m54_eigen1',answerType:'scalar',prompt:'The dominant eigenvalue of a Markov matrix is _____.',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const P=[[0.8,0.2],[0.1,0.9]]; return {type:'m54_step',answerType:'scalar',prompt:'P=[[0.8,0.2],[0.1,0.9]], v=[1,0]. Pv = ?',answer:'(0.8,0.1)',display:'(0.8,0.1)',data:{P}}; },
        () => { return {type:'m54_speed',answerType:'scalar',prompt:'Convergence speed depends on the gap between top two _____.',answer:'eigenvalues',display:'Eigenvalues',data:{}}; },
        () => { return {type:'m54_norm',answerType:'scalar',prompt:'After each multiplication, we normalize to keep the vector\'s _____ at 1.',answer:'magnitude',display:'Magnitude',data:{}}; },
      ],
      hard: [
        () => { const P=[[0.7,0.3],[0.4,0.6]]; const det=P[0][0]*P[1][1]-P[0][1]*P[1][0]; return {type:'m54_det',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]]. det(P) = '+det.toFixed(2)+'. Dominant eigenvalue?',answer:'1',display:'1',data:{P,det}}; },
        () => { return {type:'m54_markov',answerType:'scalar',prompt:'Row sums of any Markov transition matrix equal _____.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m54_converge_check',answerType:'scalar',prompt:'P=[[0.8,0.2],[0.1,0.9]]. vâ‚‚=0.9>0.8=vâ‚ â†’ converges. Gap = ?',answer:'0.1',display:'0.1',data:{}}; },
      ],
    },
    // Mission 55: Dimensionality Reduction (PCA)
    55: {
      easy: [
        () => { return {type:'m55_pca',answerType:'scalar',prompt:'PCA finds directions of maximum _____.',answer:'variance',display:'Variance',data:{}}; },
        () => { return {type:'m55_eigen',answerType:'scalar',prompt:'Largest eigenvalue = direction of most _____.',answer:'variance',display:'Variance',data:{}}; },
        () => { return {type:'m55_reduce',answerType:'scalar',prompt:'Reducing dimensions always loses some information? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { return {type:'m55_components',answerType:'scalar',prompt:'Principal components are eigenvectors of the _____ matrix.',answer:'covariance',display:'Covariance',data:{}}; },
        () => { return {type:'m55_k',answerType:'scalar',prompt:'To reduce from p dims to k dims, keep top k _____.',answer:'eigenvectors',display:'Eigenvectors',data:{}}; },
        () => { return {type:'m55_explained',answerType:'scalar',prompt:'The first PC explains the most _____.',answer:'variance',display:'Variance',data:{}}; },
      ],
      hard: [
        () => { const vals=[ri(3,10),ri(1,5),ri(1,3)]; const sum=vals.reduce((a,b)=>a+b,0); return {type:'m55_ratio',answerType:'scalar',prompt:'Eigenvalues: '+vals.join(', ')+'. Explained variance of PC1?',answer:String(rnd2(vals[0]/sum*100))+'%',display:rnd2(vals[0]/sum*100)+'%',data:{vals,sum}}; },
        () => { return {type:'m55_components',answerType:'scalar',prompt:'5D data, keep 2 PCs. Remaining dimensions lost = ?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m55_eigen_rank',answerType:'scalar',prompt:'A 4Ã—4 matrix rank 3 has ___ non-zero eigenvalues.',answer:'3',display:'3',data:{}}; },
      ],
    },
    // Mission 56: SVD & The Big Picture
    56: {
      easy: [
        () => { return {type:'m56_nz',answerType:'scalar',prompt:'Number of non-zero singular values = _____.',answer:'rank',display:'Rank',data:{}}; },
        () => { return {type:'m56_zero_sv',answerType:'scalar',prompt:'Zero singular values correspond to which subspace?',answer:'null space',display:'Null space',data:{}}; },
        () => { return {type:'m56_four',answerType:'scalar',prompt:'SVD reveals all _____ fundamental subspaces.',answer:'4',display:'4',data:{}}; },
      ],
      medium: [
        () => { return {type:'m56_decomp',answerType:'scalar',prompt:'SVD: A = U Î£ V^T. U reveals which subspace?',answer:'column space',display:'Column space C(A)',data:{}}; },
        () => { return {type:'m56_v',answerType:'scalar',prompt:'In SVD, V reveals which subspace?',answer:'row space',display:'Row space R(A)',data:{}}; },
        () => { return {type:'m56_sigma',answerType:'scalar',prompt:'Î£ contains the _____ values on its diagonal.',answer:'singular',display:'Singular values',data:{}}; },
      ],
      hard: [
        () => { return {type:'m56_rank1',answerType:'scalar',prompt:'Rank-1 matrix: how many non-zero singular values?',answer:'1',display:'1',data:{}}; },
        () => { const A=[[1,0],[0,1]]; return {type:'m56_identity',answerType:'scalar',prompt:'SVD of identity I_2: what are the singular values?',answer:'1,1',display:'1, 1',data:{A}}; },
        () => { return {type:'m56_sigma_count',answerType:'scalar',prompt:'A 3Ã—3 matrix rank 2 has ___ non-zero singular values.',answer:'2',display:'2',data:{}}; },
      ],
    },
  };

  function generateChoices(correctAnswer, prompt) {
    const correct = String(correctAnswer).trim();
    const isNum = !isNaN(parseFloat(correct)) && isFinite(correct);
    const choices = [correct];
    const seen = new Set([correct]);
    let attempts = 0;

    while (choices.length < 4 && attempts < 80) {
      attempts++;
      let wrong;
      if (isNum) {
        const v = parseFloat(correct);
        const offsets = [-3,-2,-1,1,2,3,-5,5];
        wrong = String(v + pick(offsets));
      } else if (correct.match(/^\(.*\)$/)) {
        const inner = correct.replace(/^\(/, '').replace(/\)$/, '').split(',').map(Number);
        if (inner.every(n => !isNaN(n))) {
          const variants = inner.map((n,i) => { const v=[...inner]; v[i]=n+(Math.random()>0.5?1:-1); return '('+v.join(',')+')'; });
          variants.push('(0,0)');
          wrong = pick(variants);
        } else { continue; }
      } else if (correct.includes(':')) {
        const parts = correct.split(':');
        const a = parseInt(parts[0]) || 1, b = parseInt(parts[1]) || 1;
        wrong = pick([a+1+':'+b, a+':'+(b+1), (a>1?a-1:1)+':'+b, b+':'+a]);
      } else if (correct.includes('x')) {
        const m = correct.match(/(\d+)x(\d+)/);
        if (m) { const a=parseInt(m[1]),b=parseInt(m[2]); wrong = pick([a+'x'+(b+1), (a+1)+'x'+b, a+'x'+(b>1?b-1:1)]); }
        else { continue; }
      } else {
        const textPool = {
          'columns':['rows','diagonals','entries'], 'rows':['columns','diagonals','entries'],
          'rank':['nullity','dimension','determinant'], 'nullity':['rank','dimension','determinant'],
          '1':['2','3','0'], '2':['1','3','4'], '3':['2','4','1'], '0':['1','2','3'],
          '4':['3','5','2'], '5':['4','6','3'], '6':['5','7','4'],
          'yes':['no','sometimes','never'], 'no':['yes','sometimes','always'],
          'true':['false','sometimes','never'], 'false':['true','sometimes','always'],
          'plane':['line','point','space'], 'line':['plane','point','space'],
          'point':['line','plane','space'], 'space':['line','plane','point'],
          'perpendicular':['parallel','equal','skew'], 'parallel':['perpendicular','equal','skew'],
          'subspace':['matrix','vector','scalar'], 'projection':['rotation','reflection','scaling'],
          'addition':['multiplication','subtraction','division'], 'scaling':['addition','subtraction','rotation'],
          'overdetermined':['underdetermined','square','consistent'],
          'underdetermined':['overdetermined','square','inconsistent'],
          'basis':['matrix','vector','scalar'], 'invertible':['singular','diagonal','symmetric'],
          'sparse':['dense','full','empty'], 'dominant':['smallest','average','median'],
          'eigenvalues':['singular values','determinants','rank'],
          'variance':['mean','median','standard deviation'],
          'covariance':['correlation','variance','mean'],
          'transition':['adjacency','identity','diagonal'], 'steady':['random','initial','uniform'],
          'input':['output','column','row'], 'output':['input','column','row'],
          'kernel':['range','image','domain'], 'range':['kernel','image','domain'],
          'column space':['row space','null space','left null space'],
          'row space':['column space','null space','left null space'],
          'null space':['column space','row space','left null space'],
          'left null space':['column space','row space','null space'],
          'multiplication':['addition','subtraction','division'],
          'concurrent':['parallel','skew','perpendicular'],
          'intersect':['parallel','diverge','collapse'],
          'infinite':['zero','one','finite'],
          'least squares':['maximum likelihood','least absolute','regularization'],
          'least':['most','average','median'],
          'best':['worst','average','random'],
          'error':['correct','result','output'],
          'linearly dependent':['linearly independent','orthogonal','parallel'],
          'linearly independent':['linearly dependent','orthogonal','parallel'],
          'magnitude':['direction','angle','phase'],
          'Markov':['Euclidean','Gaussian','Bayesian'],
          'eigenvectors':['eigenvalues','determinants','singular values'],
          'users':['items','ratings','features'],
          'entries':['rows','columns','matrices'],
          'vectors':['scalars','matrices','tensors'],
          'singular':['invertible','diagonal','symmetric'],
          'inverse':['transpose','adjugate','cofactor'],
          'input space':['output space','column space','row space'],
          'output space':['input space','column space','row space'],
          'domain':['codomain','range','image'],
          'codomain':['domain','range','image'],
          'image':['domain','codomain','kernel'],
          'adjacency':['transition','incidence','identity'],
          'euclidean':['manhattan','cosine','hamming'],
          'cosine':['euclidean','manhattan','hamming'],
          'best':['worst','random','average'],
          'worst':['best','average','random'],
          'similar':['different','opposite','orthogonal'],
          'independent':['dependent','parallel','collinear'],
          'dependent':['independent','parallel','collinear'],
          'consistent':['inconsistent','singular','overdetermined'],
          'invertible':['singular','nilpotent','idempotent'],
          'normal':['tangent','secant','parallel'],
          'null space direction is on the line':['parallel to range','orthogonal to range','perpendicular to range'],
          'Ï€P=Ï€':['PÏ€=Ï€','Ï€P=0','det(P)=1'],
          'Ï€':['Ïƒ','Î»','Î¼'],
          '(1,2)':['(2,1)','(1,-2)','(-1,2)'],
          '(1,3)':['(3,1)','(1,-3)','(-1,3)'],
          '(2,1)':['(1,2)','(2,-1)','(-2,1)'],
          '(3,1)':['(1,3)','(3,-1)','(-3,1)'],
          '(1,-2,1)': ['(1,2,1)','(-1,2,1)','(1,-2,-1)'],
          '(-3,1)': ['(3,1)','(-1,3)','(3,-1)'],
          '(-2,1)': ['(2,1)','(-1,2)','(2,-1)'],
          '(1,1,1)': ['(1,1,2)','(1,2,1)','(2,1,1)'],
          '(1,-2,1)': ['(1,2,-1)','(-1,2,1)','(2,1,-1)'],
          '2x2': ['3x3','2x3','3x2'],
          '3x3': ['2x2','3x2','2x3'],
          '3': ['2','4','5'],
          '2': ['1','3','4'],
          '1': ['2','3','0'],
          '0': ['1','2','3'],
          '4': ['3','5','6'],
          '5': ['4','6','7'],
          '7': ['5','6','8'],
          'R^3': ['R^2','R^4','R^1'],
          'R^2': ['R^3','R^4','R^1'],
          'RâŠ¥N, CâŠ¥N^T': ['RâŠ¥C, NâŠ¥N^T','RâŠ¥N^T, CâŠ¥N','RâŠ¥N, CâŠ¥N'],
          'least squares': ['least absolute','maximum likelihood','least cubes'],
        };
        const lower = correct.toLowerCase();
        if (textPool[lower]) {
          wrong = pick(textPool[lower]);
        } else { continue; }
      }
      if (!seen.has(wrong)) { seen.add(wrong); choices.push(wrong); }
    }
    while (choices.length < 4) {
      choices.push('â€”');
    }
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  }

  return function generateMissionQuestion(missionId, difficulty, seen) {
    const mg = missionGens[missionId];
    if (!mg) return missionGens[1].easy[0]();
    const pool = mg[difficulty] || mg.easy;
    let q;
    if (seen && seen.size > 0 && pool.length > 1) {
      const unseen = pool.filter((_, i) => {
        const test = pool[i]();
        return !seen.has(test.type);
      });
      if (unseen.length > 0) {
        q = unseen[Math.floor(Math.random() * unseen.length)]();
      } else {
        q = pick(pool)();
        q.type = q.type + '_' + ri(1, 10000);
      }
    } else {
      q = pick(pool)();
    }
    if (difficulty === 'easy' || difficulty === 'medium') {
      const isYesNo = q.type && q.type.startsWith('yesno') || (q.prompt && q.prompt.includes('(1=yes,0=no)'));
      if (isYesNo) {
        q.choices = ['Yes', 'No'];
        q.prompt = q.prompt.replace(/\(1=yes,0=no\)/g, '').replace(/\s+/g, ' ').trim();
        q._yesno = true;
      } else if (!q.choices || q.choices.length === 0) {
        q.choices = generateChoices(q.answer, q.prompt);
      }
    }
    return q;
  };
})();

router.get('/question', (req, res) => {
  const missionId = parseInt(req.query.missionId) || 1;
  const difficulty = req.query.difficulty || 'easy';
  const seenStr = req.query.seen || '';
  const seen = new Set(seenStr.split(',').filter(Boolean));
  const id = Date.now();
  try {
    // If we have JSON-based questions for this mission, serve from JSON
    const jsonData = laMissionQuestions[missionId];
    if (jsonData && jsonData.mcqs && jsonData.mcqs[difficulty]) {
      const pool = jsonData.mcqs[difficulty];
      // Filter out seen question IDs (client sends type like 'mcq_M1Q1E1', strip prefix for matching)
      const seenIds = new Set([...seen].map(s => s.replace(/^mcq_/, '')));
      const unseen = pool.filter(q => !seenIds.has(q.id));
      const questions = unseen.length > 0 ? unseen : pool;
      const q = questions[Math.floor(Math.random() * questions.length)];
      // Shuffle the MCQ choices per request so the user can't guess the
      // answer by length/position. The check route matches by exact
      // (normalized) text, so we keep `answer` as the literal correct text.
      // Length-bias correction: when the correct option is the unique
      // longest or unique shortest, pad the other options with neutral
      // characters so length is no longer a giveaway. We add an invisible-
      // looking suffix in parens (matches how some distractors are styled)
      // to avoid visual oddity.
      const correctText = q.correct_option;
      const opts = Array.isArray(q.options) ? q.options.slice() : [];
      // Detect if correct is unique-max or unique-min length
      const lenOf = (s) => (s == null ? 0 : s.length);
      const correctLen = lenOf(correctText);
      let maxLen = correctLen, minLen = correctLen;
      for (const o of opts) {
        const l = lenOf(o);
        if (l > maxLen) maxLen = l;
        if (l < minLen) minLen = l;
      }
      const correctIsMax = correctLen === maxLen;
      const correctIsMin = correctLen === minLen;
      // Padding strategy: bring all options within 1 char of median length,
      // and ensure correct is not the unique longest/shortest.
      const allLens = [correctLen, ...opts.map(lenOf)];
      const median = allLens.slice().sort((a, b) => a - b)[Math.floor(allLens.length / 2)];
      // Pad a candidate option to a target length using neutral filler
      const pad = (s, target) => {
        if (s == null || s.length >= target) return s;
        const need = target - s.length;
        // Use middle-dot `Â·` filler that reads like punctuation continuation;
        // also pad with extra spaces if very short to keep the option block
        // looking like a regular MCQ choice.
        if (need <= 1) return s + ' ';
        return s + ' (' + 'Â·'.repeat(Math.max(0, need - 4)) + ')';
      };
      let paddedOpts = opts.slice();
      if (correctIsMax && opts.length > 1) {
        // Bring at least one distractor up to match (or exceed) the correct
        // length so correct isn't the unique longest.
        const target = correctLen;
        // pick the distractor with the shortest length to pad
        let minIdx = 0;
        for (let i = 1; i < paddedOpts.length; i++) {
          if (lenOf(paddedOpts[i]) < lenOf(paddedOpts[minIdx])) minIdx = i;
        }
        // Pad to AT LEAST target. Overhead for ' (Â·Â·Â·Â·Â·)' wrapper is 3 chars
        // (space + open-paren + close-paren), so filler length = need - 3.
        const cur = paddedOpts[minIdx];
        const need = Math.max(0, target - cur.length);
        if (need > 0) {
          const overhead = 3; // " (" + ")"
          const fillerLen = Math.max(0, need - overhead);
          if (fillerLen > 0) {
            paddedOpts[minIdx] = cur + ' (' + 'Â·'.repeat(fillerLen) + ')';
          } else {
            // Need â‰¤ 3, just append spaces
            paddedOpts[minIdx] = cur + ' '.repeat(need);
          }
        }
      } else if (correctIsMin && opts.length > 1) {
        // Bring at least one distractor down (truncate trailing filler)
        // to match the correct length, but only if safe (i.e., correct
        // isn't the only short one â€” meaning there's a longer distractor).
        // Easiest: pad a shorter distractor UP, but correct is the
        // shortest â€” pad is wrong direction. Instead, leave as-is: the
        // user might guess from short length but that's a less reliable
        // pattern than the longest.
      }
      // Shuffle after padding
      const shuffled = shuffleArray(paddedOpts);
      return res.json({
        id,
        missionId,
        difficulty,
        type: 'mcq_' + q.id,
        answerType: 'mcq',
        prompt: q.question,
        choices: shuffled,
        answer: correctText,
        display: correctText,
        explanation: q.explanation,
      });
    }
    // Fallback to algorithmic generation
    const q = MQ(missionId, difficulty, seen);
    // Shuffle MCQ choices so the user can't guess the answer by length/position.
    // Check route (line 12303+) matches by exact (normalized) text, so we keep
    // `answer`/`display` as literal correct text. Pad short distractors so the
    // correct option is not the unique longest (length-bias correction).
    if (q && Array.isArray(q.choices) && q.choices.length > 1) {
      const correctText = q.answer || q.display || '';
      const correctLen = (correctText || '').length;
      let maxLen = correctLen, minLen = correctLen;
      for (const o of q.choices) {
        const l = (o || '').length;
        if (l > maxLen) maxLen = l;
        if (l < minLen) minLen = l;
      }
      const correctIsMax = correctLen === maxLen && maxLen > 0;
      let padded = q.choices.slice();
      if (correctIsMax) {
        // pad the shortest distractor up to match (or exceed) correct length
        let minIdx = 0;
        for (let i = 1; i < padded.length; i++) {
          if ((padded[i] || '').length < (padded[minIdx] || '').length) minIdx = i;
        }
        const cur = padded[minIdx] || '';
        const need = Math.max(0, correctLen - cur.length);
        if (need > 0) {
          const overhead = 3;
          const fillerLen = Math.max(0, need - overhead);
          if (fillerLen > 0) {
            padded[minIdx] = cur + ' (' + 'Â·'.repeat(fillerLen) + ')';
          } else {
            padded[minIdx] = cur + ' '.repeat(need);
          }
        }
      }
      q.choices = shuffleArray(padded);
    }
    res.json({ id, missionId, difficulty, ...q });
  } catch (e) {
    console.error(null,'Mission quiz question error:', e);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

router.post('/check', (req, res) => {
  const { answer: expected, answerType } = req.body;
  // Refuse malformed payloads with a clean 400 instead of a 500. The
  // norm(expected) call below would otherwise TypeError on undefined and
  // fall through to the global error handler (returning
  // {"error":"Internal server error"} to the client).
  if (expected === undefined || expected === null) {
    return res.status(400).json({ error: 'answer is required' });
  }
  const raw = (req.body.userAnswer || '').trim();
  const norm = (s) => s.replace(/\s+/g, '').replace(/\u2212/g, '-').toLowerCase();
  const n = norm(raw);
  let correct = false;

  if (answerType === 'mcq') {
    // MCQ: exact text match against the correct option
    correct = n === norm(expected);
  } else if (answerType === 'scalar') {
    const parseNum = (s) => {
      s = s.replace(/\s+/g, '').replace(/\u2212/g, '-');
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 2) {
          const num = parseFloat(parts[0]);
          const den = parseFloat(parts[1]);
          if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
        }
      }
      return parseFloat(s);
    };
    const userVal = parseNum(n);
    const expVal = parseNum(norm(expected));
    if (!isNaN(userVal) && !isNaN(expVal)) {
      correct = Math.abs(userVal - expVal) < 0.5;
    } else {
      correct = n === norm(expected);
    }
  } else if (answerType === 'vector') {
    const m = n.match(/\(?([-\d.]+),([-\d.]+)\)?/);
    const e = norm(expected).match(/\(?([-\d.]+),([-\d.]+)\)?/);
    correct = m && e && Math.abs(parseFloat(m[1])-parseFloat(e[1])) < 0.01 && Math.abs(parseFloat(m[2])-parseFloat(e[2])) < 0.01;
  } else if (answerType === 'matrix') {
    const parseMat = (s) => {
      const cleaned = s.replace(/[\[\]]/g, '');
      const rows = cleaned.split(';');
      if (rows.length !== 2) return null;
      const r0 = rows[0].split(',').map(Number);
      const r1 = rows[1].split(',').map(Number);
      if (r0.length !== 2 || r1.length !== 2 || r0.some(isNaN) || r1.some(isNaN)) return null;
      return [r0, r1];
    };
    const um = parseMat(n);
    const em = parseMat(norm(expected));
    correct = um && em && um[0][0]===em[0][0] && um[0][1]===em[0][1] && um[1][0]===em[1][0] && um[1][1]===em[1][1];
  } else {
    const expLower = norm(expected);
    const textNorm = (s) => s.replace(/\s+/g, '').replace(/\u2212/g, '-').toLowerCase();
    correct = textNorm(raw) === expLower || textNorm(raw).includes(expLower) || expLower.includes(textNorm(raw));
  }

  if (!correct && !isNaN(parseFloat(expected)) && (n === 'yes' || n === 'no')) {
    const expNum = parseFloat(expected);
    if ((expNum === 1 && n === 'yes') || (expNum === 0 && n === 'no')) {
      correct = true;
    }
  }
  let display = expected;
  if (!isNaN(parseFloat(expected)) && req.body._yesno) {
    display = expected === '1' ? 'Yes' : 'No';
  }
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

module.exports = router;
