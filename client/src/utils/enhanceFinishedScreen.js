import React from "react";
import GoalSuccessScorecard from '../components/common/GoalSuccessScorecard';
import { findAllElementsByType, findElementByType, findElementWithClass, getNodeText } from './pathMapUtils';

const enhanceFinishedScreen = (node, sessionGoal) => {
    if (!node) return node;

    if (React.isValidElement(node)) {
        const isWelcomeBox = node.props && node.props.className && typeof node.props.className === 'string' && node.props.className.includes('welcome-box');
        if (isWelcomeBox) {
        const finalScoreNode = findElementWithClass(node, 'final-score');
        if (finalScoreNode) {
            const text = getNodeText(finalScoreNode);
            const numbers = text.match(/\d+/g)?.map(Number);
            if (numbers && numbers.length >= 2) {
            const [score, totalQ] = numbers;
            
            let isSuccess = false;
            if (sessionGoal === 'perfect') {
                isSuccess = score === totalQ;
            } else if (sessionGoal === 'speed' || sessionGoal === 'revision') {
                isSuccess = true;
            }
            
            if (isSuccess) {
                const resultsTable = findElementByType(node, 'ResultsTable');
                const buttons = findAllElementsByType(node, 'button');
                
                return (
                <GoalSuccessScorecard
                    score={score}
                    totalQ={totalQ}
                    sessionGoal={sessionGoal}
                    resultsTable={resultsTable}
                    buttons={buttons}
                />
                );
            }
            }
        }
        }

        if (node.props && node.props.children) {
        const enhancedChildren = React.Children.map(node.props.children, child =>
            enhanceFinishedScreen(child, sessionGoal)
        );
        return React.cloneElement(node, {}, enhancedChildren);
        }
    }

    return node;
};

export default enhanceFinishedScreen;