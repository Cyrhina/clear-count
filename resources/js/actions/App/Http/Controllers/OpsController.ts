import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
export const myProfile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myProfile.url(options),
    method: 'get',
})

myProfile.definition = {
    methods: ["get","head"],
    url: '/my-profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
myProfile.url = (options?: RouteQueryOptions) => {
    return myProfile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
myProfile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myProfile.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
myProfile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: myProfile.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
    const myProfileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: myProfile.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
        myProfileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myProfile.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
        myProfileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myProfile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    myProfile.form = myProfileForm
/**
* @see \App\Http\Controllers\OpsController::employees
 * @see app/Http/Controllers/OpsController.php:26
 * @route '/employees'
 */
export const employees = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})

employees.definition = {
    methods: ["get","head"],
    url: '/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::employees
 * @see app/Http/Controllers/OpsController.php:26
 * @route '/employees'
 */
employees.url = (options?: RouteQueryOptions) => {
    return employees.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::employees
 * @see app/Http/Controllers/OpsController.php:26
 * @route '/employees'
 */
employees.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::employees
 * @see app/Http/Controllers/OpsController.php:26
 * @route '/employees'
 */
employees.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employees.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::employees
 * @see app/Http/Controllers/OpsController.php:26
 * @route '/employees'
 */
    const employeesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: employees.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::employees
 * @see app/Http/Controllers/OpsController.php:26
 * @route '/employees'
 */
        employeesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::employees
 * @see app/Http/Controllers/OpsController.php:26
 * @route '/employees'
 */
        employeesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    employees.form = employeesForm
/**
* @see \App\Http\Controllers\OpsController::employee
 * @see app/Http/Controllers/OpsController.php:31
 * @route '/employees/{id}'
 */
export const employee = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employee.url(args, options),
    method: 'get',
})

employee.definition = {
    methods: ["get","head"],
    url: '/employees/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::employee
 * @see app/Http/Controllers/OpsController.php:31
 * @route '/employees/{id}'
 */
employee.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return employee.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::employee
 * @see app/Http/Controllers/OpsController.php:31
 * @route '/employees/{id}'
 */
employee.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employee.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::employee
 * @see app/Http/Controllers/OpsController.php:31
 * @route '/employees/{id}'
 */
employee.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employee.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::employee
 * @see app/Http/Controllers/OpsController.php:31
 * @route '/employees/{id}'
 */
    const employeeForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: employee.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::employee
 * @see app/Http/Controllers/OpsController.php:31
 * @route '/employees/{id}'
 */
        employeeForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employee.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::employee
 * @see app/Http/Controllers/OpsController.php:31
 * @route '/employees/{id}'
 */
        employeeForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employee.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    employee.form = employeeForm
/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
export const attendance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})

attendance.definition = {
    methods: ["get","head"],
    url: '/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
attendance.url = (options?: RouteQueryOptions) => {
    return attendance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
attendance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
attendance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attendance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
    const attendanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: attendance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
        attendanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attendance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
        attendanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attendance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    attendance.form = attendanceForm
/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
export const schedules = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schedules.url(options),
    method: 'get',
})

schedules.definition = {
    methods: ["get","head"],
    url: '/schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
schedules.url = (options?: RouteQueryOptions) => {
    return schedules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
schedules.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schedules.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
schedules.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: schedules.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
    const schedulesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: schedules.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
        schedulesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schedules.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
        schedulesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schedules.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    schedules.form = schedulesForm
/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
export const overtime = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtime.url(options),
    method: 'get',
})

overtime.definition = {
    methods: ["get","head"],
    url: '/overtime',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
overtime.url = (options?: RouteQueryOptions) => {
    return overtime.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
overtime.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtime.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
overtime.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overtime.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
    const overtimeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: overtime.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
        overtimeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overtime.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
        overtimeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overtime.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    overtime.form = overtimeForm
/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
export const approvals = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
approvals.url = (options?: RouteQueryOptions) => {
    return approvals.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
approvals.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
approvals.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
    const approvalsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvals.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
        approvalsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
        approvalsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    approvals.form = approvalsForm
/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
export const leave = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leave.url(options),
    method: 'get',
})

leave.definition = {
    methods: ["get","head"],
    url: '/leave',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
leave.url = (options?: RouteQueryOptions) => {
    return leave.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
leave.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leave.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
leave.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: leave.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
    const leaveForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: leave.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
        leaveForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: leave.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
        leaveForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: leave.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    leave.form = leaveForm
/**
* @see \App\Http\Controllers\OpsController::payrollIndex
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
export const payrollIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollIndex.url(options),
    method: 'get',
})

payrollIndex.definition = {
    methods: ["get","head"],
    url: '/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payrollIndex
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
payrollIndex.url = (options?: RouteQueryOptions) => {
    return payrollIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payrollIndex
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
payrollIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollIndex.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payrollIndex
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
payrollIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payrollIndex.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payrollIndex
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
    const payrollIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payrollIndex.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payrollIndex
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
        payrollIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollIndex.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payrollIndex
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
        payrollIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollIndex.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payrollIndex.form = payrollIndexForm
/**
* @see \App\Http\Controllers\OpsController::payrollShow
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
export const payrollShow = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollShow.url(args, options),
    method: 'get',
})

payrollShow.definition = {
    methods: ["get","head"],
    url: '/payroll/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payrollShow
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
payrollShow.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return payrollShow.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payrollShow
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
payrollShow.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollShow.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payrollShow
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
payrollShow.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payrollShow.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payrollShow
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
    const payrollShowForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payrollShow.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payrollShow
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
        payrollShowForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollShow.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payrollShow
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
        payrollShowForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollShow.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payrollShow.form = payrollShowForm
/**
* @see \App\Http\Controllers\OpsController::payrollInputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
export const payrollInputs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollInputs.url(options),
    method: 'get',
})

payrollInputs.definition = {
    methods: ["get","head"],
    url: '/payroll-inputs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payrollInputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
payrollInputs.url = (options?: RouteQueryOptions) => {
    return payrollInputs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payrollInputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
payrollInputs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollInputs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payrollInputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
payrollInputs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payrollInputs.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payrollInputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
    const payrollInputsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payrollInputs.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payrollInputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
        payrollInputsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollInputs.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payrollInputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
        payrollInputsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollInputs.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payrollInputs.form = payrollInputsForm
/**
* @see \App\Http\Controllers\OpsController::bonusesIndex
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
export const bonusesIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bonusesIndex.url(options),
    method: 'get',
})

bonusesIndex.definition = {
    methods: ["get","head"],
    url: '/bonuses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::bonusesIndex
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
bonusesIndex.url = (options?: RouteQueryOptions) => {
    return bonusesIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::bonusesIndex
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
bonusesIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bonusesIndex.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::bonusesIndex
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
bonusesIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: bonusesIndex.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::bonusesIndex
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
    const bonusesIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: bonusesIndex.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::bonusesIndex
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
        bonusesIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: bonusesIndex.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::bonusesIndex
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
        bonusesIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: bonusesIndex.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    bonusesIndex.form = bonusesIndexForm
/**
* @see \App\Http\Controllers\OpsController::bonusPayslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
export const bonusPayslip = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bonusPayslip.url(args, options),
    method: 'get',
})

bonusPayslip.definition = {
    methods: ["get","head"],
    url: '/bonuses/{bonusId}/payslips/{employeeId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::bonusPayslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
bonusPayslip.url = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    bonusId: args[0],
                    employeeId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonusId: args.bonusId,
                                employeeId: args.employeeId,
                }

    return bonusPayslip.definition.url
            .replace('{bonusId}', parsedArgs.bonusId.toString())
            .replace('{employeeId}', parsedArgs.employeeId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::bonusPayslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
bonusPayslip.get = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bonusPayslip.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::bonusPayslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
bonusPayslip.head = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: bonusPayslip.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::bonusPayslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
    const bonusPayslipForm = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: bonusPayslip.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::bonusPayslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
        bonusPayslipForm.get = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: bonusPayslip.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::bonusPayslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
        bonusPayslipForm.head = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: bonusPayslip.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    bonusPayslip.form = bonusPayslipForm
/**
* @see \App\Http\Controllers\OpsController::thirteenthIndex
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
export const thirteenthIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: thirteenthIndex.url(options),
    method: 'get',
})

thirteenthIndex.definition = {
    methods: ["get","head"],
    url: '/thirteenth-month-pay',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::thirteenthIndex
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
thirteenthIndex.url = (options?: RouteQueryOptions) => {
    return thirteenthIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::thirteenthIndex
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
thirteenthIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: thirteenthIndex.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::thirteenthIndex
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
thirteenthIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: thirteenthIndex.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::thirteenthIndex
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
    const thirteenthIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: thirteenthIndex.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::thirteenthIndex
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
        thirteenthIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: thirteenthIndex.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::thirteenthIndex
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
        thirteenthIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: thirteenthIndex.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    thirteenthIndex.form = thirteenthIndexForm
/**
* @see \App\Http\Controllers\OpsController::thirteenthPayslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
export const thirteenthPayslip = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: thirteenthPayslip.url(args, options),
    method: 'get',
})

thirteenthPayslip.definition = {
    methods: ["get","head"],
    url: '/thirteenth-month-pay/{runId}/payslips/{employeeId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::thirteenthPayslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
thirteenthPayslip.url = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    runId: args[0],
                    employeeId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        runId: args.runId,
                                employeeId: args.employeeId,
                }

    return thirteenthPayslip.definition.url
            .replace('{runId}', parsedArgs.runId.toString())
            .replace('{employeeId}', parsedArgs.employeeId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::thirteenthPayslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
thirteenthPayslip.get = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: thirteenthPayslip.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::thirteenthPayslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
thirteenthPayslip.head = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: thirteenthPayslip.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::thirteenthPayslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
    const thirteenthPayslipForm = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: thirteenthPayslip.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::thirteenthPayslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
        thirteenthPayslipForm.get = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: thirteenthPayslip.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::thirteenthPayslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
        thirteenthPayslipForm.head = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: thirteenthPayslip.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    thirteenthPayslip.form = thirteenthPayslipForm
/**
* @see \App\Http\Controllers\OpsController::payslipsIndex
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
export const payslipsIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslipsIndex.url(options),
    method: 'get',
})

payslipsIndex.definition = {
    methods: ["get","head"],
    url: '/payslips',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payslipsIndex
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
payslipsIndex.url = (options?: RouteQueryOptions) => {
    return payslipsIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payslipsIndex
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
payslipsIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslipsIndex.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payslipsIndex
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
payslipsIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payslipsIndex.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payslipsIndex
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
    const payslipsIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payslipsIndex.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payslipsIndex
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
        payslipsIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslipsIndex.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payslipsIndex
 * @see app/Http/Controllers/OpsController.php:96
 * @route '/payslips'
 */
        payslipsIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslipsIndex.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payslipsIndex.form = payslipsIndexForm
/**
* @see \App\Http\Controllers\OpsController::payslipsShow
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
export const payslipsShow = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslipsShow.url(args, options),
    method: 'get',
})

payslipsShow.definition = {
    methods: ["get","head"],
    url: '/payslips/{lineId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payslipsShow
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
payslipsShow.url = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { lineId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    lineId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        lineId: args.lineId,
                }

    return payslipsShow.definition.url
            .replace('{lineId}', parsedArgs.lineId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payslipsShow
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
payslipsShow.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslipsShow.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payslipsShow
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
payslipsShow.head = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payslipsShow.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payslipsShow
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
    const payslipsShowForm = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payslipsShow.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payslipsShow
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
        payslipsShowForm.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslipsShow.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payslipsShow
 * @see app/Http/Controllers/OpsController.php:101
 * @route '/payslips/{lineId}'
 */
        payslipsShowForm.head = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslipsShow.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payslipsShow.form = payslipsShowForm
/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
export const statutory = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statutory.url(options),
    method: 'get',
})

statutory.definition = {
    methods: ["get","head"],
    url: '/statutory',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
statutory.url = (options?: RouteQueryOptions) => {
    return statutory.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
statutory.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statutory.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
statutory.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statutory.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
    const statutoryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: statutory.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
        statutoryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: statutory.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
        statutoryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: statutory.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    statutory.form = statutoryForm
/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
export const loans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loans.url(options),
    method: 'get',
})

loans.definition = {
    methods: ["get","head"],
    url: '/loans-deductions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
loans.url = (options?: RouteQueryOptions) => {
    return loans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
loans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
loans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: loans.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
    const loansForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: loans.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
        loansForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: loans.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
        loansForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: loans.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    loans.form = loansForm
/**
* @see \App\Http\Controllers\OpsController::essHome
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
export const essHome = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essHome.url(options),
    method: 'get',
})

essHome.definition = {
    methods: ["get","head"],
    url: '/ess',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essHome
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
essHome.url = (options?: RouteQueryOptions) => {
    return essHome.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essHome
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
essHome.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essHome.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essHome
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
essHome.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essHome.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essHome
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
    const essHomeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essHome.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essHome
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
        essHomeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essHome.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essHome
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
        essHomeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essHome.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essHome.form = essHomeForm
/**
* @see \App\Http\Controllers\OpsController::essProfile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
export const essProfile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essProfile.url(options),
    method: 'get',
})

essProfile.definition = {
    methods: ["get","head"],
    url: '/ess/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essProfile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
essProfile.url = (options?: RouteQueryOptions) => {
    return essProfile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essProfile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
essProfile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essProfile.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essProfile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
essProfile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essProfile.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essProfile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
    const essProfileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essProfile.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essProfile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
        essProfileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essProfile.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essProfile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
        essProfileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essProfile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essProfile.form = essProfileForm
/**
* @see \App\Http\Controllers\OpsController::essPayslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
export const essPayslips = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essPayslips.url(options),
    method: 'get',
})

essPayslips.definition = {
    methods: ["get","head"],
    url: '/ess/payslips',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essPayslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
essPayslips.url = (options?: RouteQueryOptions) => {
    return essPayslips.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essPayslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
essPayslips.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essPayslips.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essPayslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
essPayslips.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essPayslips.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essPayslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
    const essPayslipsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essPayslips.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essPayslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
        essPayslipsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essPayslips.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essPayslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
        essPayslipsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essPayslips.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essPayslips.form = essPayslipsForm
/**
* @see \App\Http\Controllers\OpsController::essPayslipsShow
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
export const essPayslipsShow = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essPayslipsShow.url(args, options),
    method: 'get',
})

essPayslipsShow.definition = {
    methods: ["get","head"],
    url: '/ess/payslips/{lineId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essPayslipsShow
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
essPayslipsShow.url = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { lineId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    lineId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        lineId: args.lineId,
                }

    return essPayslipsShow.definition.url
            .replace('{lineId}', parsedArgs.lineId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essPayslipsShow
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
essPayslipsShow.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essPayslipsShow.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essPayslipsShow
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
essPayslipsShow.head = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essPayslipsShow.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essPayslipsShow
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
    const essPayslipsShowForm = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essPayslipsShow.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essPayslipsShow
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
        essPayslipsShowForm.get = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essPayslipsShow.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essPayslipsShow
 * @see app/Http/Controllers/OpsController.php:131
 * @route '/ess/payslips/{lineId}'
 */
        essPayslipsShowForm.head = (args: { lineId: string | number } | [lineId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essPayslipsShow.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essPayslipsShow.form = essPayslipsShowForm
/**
* @see \App\Http\Controllers\OpsController::essAttendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
export const essAttendance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essAttendance.url(options),
    method: 'get',
})

essAttendance.definition = {
    methods: ["get","head"],
    url: '/ess/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essAttendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
essAttendance.url = (options?: RouteQueryOptions) => {
    return essAttendance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essAttendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
essAttendance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essAttendance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essAttendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
essAttendance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essAttendance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essAttendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
    const essAttendanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essAttendance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essAttendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
        essAttendanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essAttendance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essAttendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
        essAttendanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essAttendance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essAttendance.form = essAttendanceForm
/**
* @see \App\Http\Controllers\OpsController::essOvertime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
export const essOvertime = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essOvertime.url(options),
    method: 'get',
})

essOvertime.definition = {
    methods: ["get","head"],
    url: '/ess/overtime',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essOvertime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
essOvertime.url = (options?: RouteQueryOptions) => {
    return essOvertime.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essOvertime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
essOvertime.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essOvertime.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essOvertime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
essOvertime.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essOvertime.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essOvertime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
    const essOvertimeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essOvertime.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essOvertime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
        essOvertimeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essOvertime.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essOvertime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
        essOvertimeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essOvertime.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essOvertime.form = essOvertimeForm
/**
* @see \App\Http\Controllers\OpsController::essSchedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
export const essSchedule = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essSchedule.url(options),
    method: 'get',
})

essSchedule.definition = {
    methods: ["get","head"],
    url: '/ess/schedule',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essSchedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
essSchedule.url = (options?: RouteQueryOptions) => {
    return essSchedule.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essSchedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
essSchedule.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essSchedule.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essSchedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
essSchedule.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essSchedule.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essSchedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
    const essScheduleForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essSchedule.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essSchedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
        essScheduleForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essSchedule.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essSchedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
        essScheduleForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essSchedule.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essSchedule.form = essScheduleForm
/**
* @see \App\Http\Controllers\OpsController::essWorkOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
export const essWorkOutput = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essWorkOutput.url(options),
    method: 'get',
})

essWorkOutput.definition = {
    methods: ["get","head"],
    url: '/ess/work-output',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essWorkOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
essWorkOutput.url = (options?: RouteQueryOptions) => {
    return essWorkOutput.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essWorkOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
essWorkOutput.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essWorkOutput.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essWorkOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
essWorkOutput.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essWorkOutput.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essWorkOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
    const essWorkOutputForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essWorkOutput.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essWorkOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
        essWorkOutputForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essWorkOutput.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essWorkOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
        essWorkOutputForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essWorkOutput.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essWorkOutput.form = essWorkOutputForm
/**
* @see \App\Http\Controllers\OpsController::essLeave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
export const essLeave = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essLeave.url(options),
    method: 'get',
})

essLeave.definition = {
    methods: ["get","head"],
    url: '/ess/leave',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essLeave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
essLeave.url = (options?: RouteQueryOptions) => {
    return essLeave.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essLeave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
essLeave.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essLeave.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essLeave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
essLeave.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essLeave.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essLeave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
    const essLeaveForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essLeave.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essLeave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
        essLeaveForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essLeave.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essLeave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
        essLeaveForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essLeave.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essLeave.form = essLeaveForm
/**
* @see \App\Http\Controllers\OpsController::essLoans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
export const essLoans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essLoans.url(options),
    method: 'get',
})

essLoans.definition = {
    methods: ["get","head"],
    url: '/ess/loans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::essLoans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
essLoans.url = (options?: RouteQueryOptions) => {
    return essLoans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::essLoans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
essLoans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: essLoans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::essLoans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
essLoans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: essLoans.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::essLoans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
    const essLoansForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: essLoans.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::essLoans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
        essLoansForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essLoans.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::essLoans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
        essLoansForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: essLoans.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    essLoans.form = essLoansForm
/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
export const notifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})

notifications.definition = {
    methods: ["get","head"],
    url: '/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
notifications.url = (options?: RouteQueryOptions) => {
    return notifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
notifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
notifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notifications.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
    const notificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notifications.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
        notificationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
        notificationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notifications.form = notificationsForm
/**
* @see \App\Http\Controllers\OpsController::reportsIndex
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
export const reportsIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reportsIndex.url(options),
    method: 'get',
})

reportsIndex.definition = {
    methods: ["get","head"],
    url: '/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::reportsIndex
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
reportsIndex.url = (options?: RouteQueryOptions) => {
    return reportsIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::reportsIndex
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
reportsIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reportsIndex.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::reportsIndex
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
reportsIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reportsIndex.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::reportsIndex
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
    const reportsIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reportsIndex.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::reportsIndex
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
        reportsIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reportsIndex.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::reportsIndex
 * @see app/Http/Controllers/OpsController.php:171
 * @route '/reports'
 */
        reportsIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reportsIndex.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    reportsIndex.form = reportsIndexForm
/**
* @see \App\Http\Controllers\OpsController::reportsShow
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
export const reportsShow = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reportsShow.url(args, options),
    method: 'get',
})

reportsShow.definition = {
    methods: ["get","head"],
    url: '/reports/{reportId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::reportsShow
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
reportsShow.url = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reportId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    reportId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        reportId: args.reportId,
                }

    return reportsShow.definition.url
            .replace('{reportId}', parsedArgs.reportId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::reportsShow
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
reportsShow.get = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reportsShow.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::reportsShow
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
reportsShow.head = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reportsShow.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::reportsShow
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
    const reportsShowForm = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: reportsShow.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::reportsShow
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
        reportsShowForm.get = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reportsShow.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::reportsShow
 * @see app/Http/Controllers/OpsController.php:176
 * @route '/reports/{reportId}'
 */
        reportsShowForm.head = (args: { reportId: string | number } | [reportId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: reportsShow.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    reportsShow.form = reportsShowForm
/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
export const insights = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: insights.url(options),
    method: 'get',
})

insights.definition = {
    methods: ["get","head"],
    url: '/insights',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
insights.url = (options?: RouteQueryOptions) => {
    return insights.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
insights.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: insights.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
insights.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: insights.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
    const insightsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: insights.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
        insightsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: insights.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
        insightsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: insights.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    insights.form = insightsForm
/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
export const userAccess = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userAccess.url(options),
    method: 'get',
})

userAccess.definition = {
    methods: ["get","head"],
    url: '/user-access',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
userAccess.url = (options?: RouteQueryOptions) => {
    return userAccess.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
userAccess.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userAccess.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
userAccess.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userAccess.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
    const userAccessForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: userAccess.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
        userAccessForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userAccess.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
        userAccessForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userAccess.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    userAccess.form = userAccessForm
/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
export const companySettings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companySettings.url(options),
    method: 'get',
})

companySettings.definition = {
    methods: ["get","head"],
    url: '/company-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
companySettings.url = (options?: RouteQueryOptions) => {
    return companySettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
companySettings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companySettings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
companySettings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: companySettings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
    const companySettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: companySettings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
        companySettingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companySettings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
        companySettingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companySettings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    companySettings.form = companySettingsForm
/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
export const onboarding = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: onboarding.url(options),
    method: 'get',
})

onboarding.definition = {
    methods: ["get","head"],
    url: '/onboarding',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
onboarding.url = (options?: RouteQueryOptions) => {
    return onboarding.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
onboarding.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: onboarding.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
onboarding.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: onboarding.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
    const onboardingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: onboarding.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
        onboardingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: onboarding.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
        onboardingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: onboarding.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    onboarding.form = onboardingForm
/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
export const branches = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})

branches.definition = {
    methods: ["get","head"],
    url: '/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
branches.url = (options?: RouteQueryOptions) => {
    return branches.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
branches.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
branches.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: branches.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
    const branchesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: branches.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
        branchesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branches.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
        branchesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branches.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    branches.form = branchesForm
/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
export const subscription = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})

subscription.definition = {
    methods: ["get","head"],
    url: '/subscription',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
subscription.url = (options?: RouteQueryOptions) => {
    return subscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
subscription.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
subscription.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscription.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
    const subscriptionForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: subscription.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
        subscriptionForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: subscription.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
        subscriptionForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: subscription.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    subscription.form = subscriptionForm
/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
export const integrations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: integrations.url(options),
    method: 'get',
})

integrations.definition = {
    methods: ["get","head"],
    url: '/integrations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
integrations.url = (options?: RouteQueryOptions) => {
    return integrations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
integrations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: integrations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
integrations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: integrations.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
    const integrationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: integrations.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
        integrationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: integrations.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
        integrationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: integrations.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    integrations.form = integrationsForm
/**
* @see \App\Http\Controllers\OpsController::platformCompanies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
export const platformCompanies = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: platformCompanies.url(options),
    method: 'get',
})

platformCompanies.definition = {
    methods: ["get","head"],
    url: '/platform/companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::platformCompanies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
platformCompanies.url = (options?: RouteQueryOptions) => {
    return platformCompanies.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::platformCompanies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
platformCompanies.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: platformCompanies.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::platformCompanies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
platformCompanies.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: platformCompanies.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::platformCompanies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
    const platformCompaniesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: platformCompanies.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::platformCompanies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
        platformCompaniesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: platformCompanies.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::platformCompanies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
        platformCompaniesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: platformCompanies.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    platformCompanies.form = platformCompaniesForm
/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
export const forbidden = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forbidden.url(options),
    method: 'get',
})

forbidden.definition = {
    methods: ["get","head"],
    url: '/forbidden',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
forbidden.url = (options?: RouteQueryOptions) => {
    return forbidden.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
forbidden.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forbidden.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
forbidden.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forbidden.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
    const forbiddenForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forbidden.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
        forbiddenForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forbidden.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
        forbiddenForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forbidden.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    forbidden.form = forbiddenForm
const OpsController = { dashboard, myProfile, employees, employee, attendance, schedules, overtime, approvals, leave, payrollIndex, payrollShow, payrollInputs, bonusesIndex, bonusPayslip, thirteenthIndex, thirteenthPayslip, payslipsIndex, payslipsShow, statutory, loans, essHome, essProfile, essPayslips, essPayslipsShow, essAttendance, essOvertime, essSchedule, essWorkOutput, essLeave, essLoans, notifications, reportsIndex, reportsShow, insights, userAccess, companySettings, onboarding, branches, subscription, integrations, platformCompanies, forbidden }

export default OpsController