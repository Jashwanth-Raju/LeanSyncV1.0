export const PROFILE_OPTIONS = [
    {
        id: "manufacturing",
        label: "Manufacturing",
        description: "Factory, plant, and production flow intelligence",
        accent: "#6366F1",
    },
    {
        id: "logistics",
        label: "Logistics",
        description: "Distribution centers, 3PL, and fulfillment orchestration",
        accent: "#14B8A6",
    },
    {
        id: "healthcare",
        label: "Healthcare",
        description: "Patient throughput, labs, and hospital operations",
        accent: "#EC4899",
    },
    {
        id: "generic",
        label: "Generic",
        description: "Lightweight BPM for any cross-functional process",
        accent: "#FBBF24",
    },
];
export const getProfileMeta = (id) => {
    return PROFILE_OPTIONS.find((profile) => profile.id === id) ?? PROFILE_OPTIONS[0];
};
