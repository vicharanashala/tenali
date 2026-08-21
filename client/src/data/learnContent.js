export const getLearnContent = async (modeKey, topicName) => {
  try {
    const data = await import(`./learnContent/${modeKey}.json`);
    const content = data.default || data;
    return {
      title: content.title,
      blocks: content.blocks
    };
  } catch (error) {
    console.error(`Failed to load learn content for ${modeKey}:`, error);
    // Fallback if missing
    return {
      title: `Learning: ${topicName}`,
      blocks: [
        {
          icon: "📚",
          title: "1. Overview",
          content: `Welcome to the comprehensive learning module for **${topicName}**. Before you test your skills, it's crucial to understand the foundational concepts. Pay close attention to the rules and methodologies described here.`
        },
        {
          icon: "🧠",
          title: "2. The Core Concept",
          content: "Mathematics builds on itself. This topic requires you to understand the basic definitions and how they interact. Focus on the 'why' before the 'how'."
        },
        {
          icon: "⚙️",
          title: "3. Step-by-Step Method",
          content: "1. Read the problem carefully and identify what is being asked.\n2. Recall the relevant formula or rule for this topic.\n3. Substitute the known values.\n4. Solve systematically, showing all your working.\n5. Double-check if your answer makes logical sense."
        },
        {
          icon: "⚠️",
          title: "4. Common Pitfalls",
          content: "The most common mistakes in this topic come from rushing. Specifically: dropping negative signs, mixing up the order of operations (BODMAS/PEMDAS), and misreading the question."
        },
        {
          icon: "💡",
          title: "5. Pro Tip",
          content: "Don't just memorize — try to visualize the problem. Drawing a quick sketch or writing out the given variables is half the battle!"
        }
      ]
    };
  }
};
