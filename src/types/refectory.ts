export type EnrolledStudent = {
    id: string;
    name: string;
    class: string;
    gender: 'male' | 'female';
};

export type RefectoryTable = {
    tableNumber: number;
    serie: 1 | 2;
    boys: EnrolledStudent[];
    girls: EnrolledStudent[];
};

export type SeatingChart = {
    morning: RefectoryTable[];
    evening: RefectoryTable[];
};
