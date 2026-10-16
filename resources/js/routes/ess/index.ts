import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import payslips8176aa from './payslips'
/**
* @see \App\Http\Controllers\OpsController::home
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/ess',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::home
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::home
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::home
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::home
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
    const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: home.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::home
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
        homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::home
 * @see app/Http/Controllers/OpsController.php:116
 * @route '/ess'
 */
        homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    home.form = homeForm
/**
* @see \App\Http\Controllers\OpsController::profile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
export const profile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

profile.definition = {
    methods: ["get","head"],
    url: '/ess/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::profile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
profile.url = (options?: RouteQueryOptions) => {
    return profile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::profile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
profile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::profile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
profile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: profile.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::profile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
    const profileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: profile.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::profile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
        profileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::profile
 * @see app/Http/Controllers/OpsController.php:121
 * @route '/ess/profile'
 */
        profileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: profile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    profile.form = profileForm
/**
* @see \App\Http\Controllers\OpsController::payslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
export const payslips = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslips.url(options),
    method: 'get',
})

payslips.definition = {
    methods: ["get","head"],
    url: '/ess/payslips',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
payslips.url = (options?: RouteQueryOptions) => {
    return payslips.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
payslips.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslips.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
payslips.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payslips.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
    const payslipsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payslips.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
        payslipsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslips.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payslips
 * @see app/Http/Controllers/OpsController.php:126
 * @route '/ess/payslips'
 */
        payslipsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslips.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payslips.form = payslipsForm
/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
export const attendance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})

attendance.definition = {
    methods: ["get","head"],
    url: '/ess/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
attendance.url = (options?: RouteQueryOptions) => {
    return attendance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
attendance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
attendance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attendance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
    const attendanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: attendance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
 */
        attendanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attendance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:136
 * @route '/ess/attendance'
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
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
export const overtime = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtime.url(options),
    method: 'get',
})

overtime.definition = {
    methods: ["get","head"],
    url: '/ess/overtime',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
overtime.url = (options?: RouteQueryOptions) => {
    return overtime.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
overtime.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtime.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
overtime.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overtime.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
    const overtimeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: overtime.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
 */
        overtimeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overtime.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:141
 * @route '/ess/overtime'
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
* @see \App\Http\Controllers\OpsController::schedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
export const schedule = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schedule.url(options),
    method: 'get',
})

schedule.definition = {
    methods: ["get","head"],
    url: '/ess/schedule',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::schedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
schedule.url = (options?: RouteQueryOptions) => {
    return schedule.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::schedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
schedule.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schedule.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::schedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
schedule.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: schedule.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::schedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
    const scheduleForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: schedule.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::schedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
        scheduleForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schedule.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::schedule
 * @see app/Http/Controllers/OpsController.php:146
 * @route '/ess/schedule'
 */
        scheduleForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schedule.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    schedule.form = scheduleForm
/**
* @see \App\Http\Controllers\OpsController::workOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
export const workOutput = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workOutput.url(options),
    method: 'get',
})

workOutput.definition = {
    methods: ["get","head"],
    url: '/ess/work-output',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::workOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
workOutput.url = (options?: RouteQueryOptions) => {
    return workOutput.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::workOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
workOutput.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workOutput.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::workOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
workOutput.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: workOutput.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::workOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
    const workOutputForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: workOutput.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::workOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
        workOutputForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workOutput.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::workOutput
 * @see app/Http/Controllers/OpsController.php:151
 * @route '/ess/work-output'
 */
        workOutputForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workOutput.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    workOutput.form = workOutputForm
/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
export const leave = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leave.url(options),
    method: 'get',
})

leave.definition = {
    methods: ["get","head"],
    url: '/ess/leave',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
leave.url = (options?: RouteQueryOptions) => {
    return leave.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
leave.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leave.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
leave.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: leave.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
    const leaveForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: leave.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
 */
        leaveForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: leave.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:156
 * @route '/ess/leave'
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
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
export const loans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loans.url(options),
    method: 'get',
})

loans.definition = {
    methods: ["get","head"],
    url: '/ess/loans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
loans.url = (options?: RouteQueryOptions) => {
    return loans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
loans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
loans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: loans.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
    const loansForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: loans.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
 */
        loansForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: loans.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:161
 * @route '/ess/loans'
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
const ess = {
    home: Object.assign(home, home),
profile: Object.assign(profile, profile),
payslips: Object.assign(payslips, payslips8176aa),
attendance: Object.assign(attendance, attendance),
overtime: Object.assign(overtime, overtime),
schedule: Object.assign(schedule, schedule),
workOutput: Object.assign(workOutput, workOutput),
leave: Object.assign(leave, leave),
loans: Object.assign(loans, loans),
}

export default ess