import employees from './employees'
import attendance from './attendance'
import payroll from './payroll'
const v1 = {
    employees: Object.assign(employees, employees),
attendance: Object.assign(attendance, attendance),
payroll: Object.assign(payroll, payroll),
}

export default v1