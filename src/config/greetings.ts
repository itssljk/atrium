const TIME_BASED_SUBTEXTS: Record<string, string[]> = {
    lateNight: [
        "Rest well and sweet dreams",
        "Burning the midnight oil?",
        "Time to recharge for tomorrow",
        "Don't forget to get some rest",
        "Quiet hours, peaceful minds",
        "Sleep is the best meditation",
        "Rest is productive too",
    ],
    dawn: [
        "A brand new dawn is here",
        "The early bird gets the quiet hours",
        "Embrace the fresh start of today",
        "Breathe in the calm morning air",
        "Rise and shine with purpose",
        "A peaceful start to a bright day",
    ],
    morning: [
        "Embrace the fresh start of today",
        "Make today wonderfully productive",
        "Coffee brewed, ready to conquer",
        "Small progress every day adds up",
        "Bring your best energy to today",
        "Fresh day, fresh perspectives",
    ],
    afternoon: [
        "Keep up the great momentum",
        "Stay focused, you're doing great",
        "Take a quick stretch and stay hydrated",
        "Afternoon focus mode engaged",
        "Halfway through the day, keep shining",
        "Make the rest of today count",
    ],
    evening: [
        "Time to wind down and relax",
        "Reflect on today's accomplishments",
        "Unwind and enjoy your evening",
        "Switch off and recharge your energy",
        "A cozy evening awaits you",
        "Celebrate today's wins, big or small",
    ],
    night: [
        "Rest well and sweet dreams",
        "Time to put the screens away",
        "Let go of today, tomorrow is a new canvas",
        "Peaceful night and restful sleep",
        "Rest is the foundation of energy",
    ],
};
const DAY_SPECIFIC_SUBTEXTS: Record<number, {
    morning?: string[];
    afternoon?: string[];
    evening?: string[];
}> = {
    0: {
        morning: ["Quiet Sunday mornings are golden", "Relax and take it easy today"],
        afternoon: ["Enjoy a peaceful Sunday afternoon", "Recharge your spirit today"],
        evening: ["Rest well and prepare for the week ahead", "Gentle close to a lovely weekend"],
    },
    1: {
        morning: ["New week, fresh start, endless possibilities", "Set a winning tone for the week"],
        afternoon: ["Strong start to the week, keep rolling", "Powering through Monday with focus"],
        evening: ["Great start to the week, rest up tonight", "Monday wrapped, well done"],
    },
    2: {
        morning: ["Keep the weekly momentum rolling", "Focused and dialed in for Tuesday"],
        afternoon: ["Tuesday progress in full swing", "Building steady momentum"],
        evening: ["Unwind after a productive Tuesday", "Relax and enjoy your evening"],
    },
    3: {
        morning: ["Halfway through the week, keep going!", "Midweek energy is strong"],
        afternoon: ["Conquering the midweek hump with ease", "Wednesday focus on point"],
        evening: ["Midweek milestone achieved, take it easy", "Relax, the weekend is getting closer"],
    },
    4: {
        morning: ["Almost at the finish line, let's do this", "Thursday drive and clarity"],
        afternoon: ["Wrapping up the week's major goals", "Final push before the weekend"],
        evening: ["One more day to go, rest well tonight", "Thursday evening tranquility"],
    },
    5: {
        morning: ["Finish the week strong!", "Friday is here, make it count"],
        afternoon: ["Almost there, weekend vibes loading", "Wrapping up the week's triumphs"],
        evening: ["Happy Friday! Time to celebrate and relax", "Weekend mode officially activated"],
    },
    6: {
        morning: ["Enjoy your well-deserved weekend", "A slow, relaxing Saturday morning"],
        afternoon: ["Saturday sunshine and good times", "Take time for the things you love"],
        evening: ["Cozy Saturday night vibes", "Unwind and enjoy your free time"],
    },
};
function getTimeBracket(hour: number): {
    key: keyof typeof TIME_BASED_SUBTEXTS;
    salutation: string;
    dayPeriod?: "morning" | "afternoon" | "evening";
} {
    if (hour < 5) {
        return { key: "lateNight", salutation: "Good night" };
    }
    if (hour < 8) {
        return { key: "dawn", salutation: "Good morning", dayPeriod: "morning" };
    }
    if (hour < 12) {
        return { key: "morning", salutation: "Good morning", dayPeriod: "morning" };
    }
    if (hour < 17) {
        return { key: "afternoon", salutation: "Good afternoon", dayPeriod: "afternoon" };
    }
    if (hour < 22) {
        return { key: "evening", salutation: "Good evening", dayPeriod: "evening" };
    }
    return { key: "night", salutation: "Good night" };
}
export function getGreetingPool(date: Date): {
    salutation: string;
    pool: string[];
} {
    const hour = date.getHours();
    const day = date.getDay();
    const { key, salutation, dayPeriod } = getTimeBracket(hour);
    const basePool = TIME_BASED_SUBTEXTS[key] || ["Embrace today"];
    const dayPool = dayPeriod && DAY_SPECIFIC_SUBTEXTS[day]?.[dayPeriod] ? DAY_SPECIFIC_SUBTEXTS[day][dayPeriod]! : [];
    return {
        salutation,
        pool: [...dayPool, ...basePool],
    };
}
