export type EmploymentStatus = 'active' | 'inactive' | 'archived';

export type Employee = {
    id: number;
    company_id: number;
    branch_id: number;
    employee_number: string;
    name: string;
    department: string | null;
    status: EmploymentStatus;
    personal: {
        firstName: string;
        lastName: string;
        birthDate: string;
        civilStatus: 'single' | 'married' | 'widowed' | 'separated';
        address: string;
        contactNumber: string;
        personalEmail?: string;
    };
    employment: {
        position: string;
        department: string;
        employmentType: 'regular' | 'probationary' | 'contractual' | 'part_time';
        dateHired: string;
        status: EmploymentStatus;
        category: string;
    };
    compensation: {
        basicPay: number;
        payType: 'monthly' | 'semi_monthly' | 'daily' | 'hourly' | 'output_based';
        allowances: { label: string; amount: number }[];
    };
    branch?: { id: number; name: string };
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
