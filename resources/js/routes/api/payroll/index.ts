import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import lines from './lines'
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
export const employees = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})

employees.definition = {
    methods: ["get","head"],
    url: '/api/payroll/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
employees.url = (options?: RouteQueryOptions) => {
    return employees.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
employees.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
employees.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employees.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
    const employeesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: employees.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
        employeesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
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
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
export const nextNumber = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: nextNumber.url(options),
    method: 'get',
})

nextNumber.definition = {
    methods: ["get","head"],
    url: '/api/payroll/next-number',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
nextNumber.url = (options?: RouteQueryOptions) => {
    return nextNumber.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
nextNumber.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: nextNumber.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
nextNumber.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: nextNumber.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
    const nextNumberForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: nextNumber.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
        nextNumberForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: nextNumber.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
        nextNumberForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: nextNumber.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    nextNumber.form = nextNumberForm
/**
* @see \App\Http\Controllers\PayrollInputsController::records
 * @see app/Http/Controllers/PayrollInputsController.php:95
 * @route '/api/payroll/{period}/records'
 */
export const records = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: records.url(args, options),
    method: 'get',
})

records.definition = {
    methods: ["get","head"],
    url: '/api/payroll/{period}/records',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollInputsController::records
 * @see app/Http/Controllers/PayrollInputsController.php:95
 * @route '/api/payroll/{period}/records'
 */
records.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return records.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollInputsController::records
 * @see app/Http/Controllers/PayrollInputsController.php:95
 * @route '/api/payroll/{period}/records'
 */
records.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: records.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollInputsController::records
 * @see app/Http/Controllers/PayrollInputsController.php:95
 * @route '/api/payroll/{period}/records'
 */
records.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: records.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollInputsController::records
 * @see app/Http/Controllers/PayrollInputsController.php:95
 * @route '/api/payroll/{period}/records'
 */
    const recordsForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: records.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollInputsController::records
 * @see app/Http/Controllers/PayrollInputsController.php:95
 * @route '/api/payroll/{period}/records'
 */
        recordsForm.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: records.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollInputsController::records
 * @see app/Http/Controllers/PayrollInputsController.php:95
 * @route '/api/payroll/{period}/records'
 */
        recordsForm.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: records.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    records.form = recordsForm
/**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
export const run = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

run.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/run',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
run.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return run.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
run.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
    const runForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: run.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
        runForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: run.url(args, options),
            method: 'post',
        })
    
    run.form = runForm
/**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
export const hold = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hold.url(args, options),
    method: 'post',
})

hold.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/hold',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
hold.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return hold.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
hold.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hold.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
    const holdForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: hold.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
        holdForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: hold.url(args, options),
            method: 'post',
        })
    
    hold.form = holdForm
/**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
export const release = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: release.url(args, options),
    method: 'post',
})

release.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/release',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
release.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return release.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
release.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: release.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
    const releaseForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: release.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
        releaseForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: release.url(args, options),
            method: 'post',
        })
    
    release.form = releaseForm
/**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
export const approve = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
approve.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return approve.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
approve.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
    const approveForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
        approveForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
export const finalize = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finalize.url(args, options),
    method: 'post',
})

finalize.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/finalize',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
finalize.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return finalize.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
finalize.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finalize.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
    const finalizeForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: finalize.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
        finalizeForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: finalize.url(args, options),
            method: 'post',
        })
    
    finalize.form = finalizeForm
const payroll = {
    index: Object.assign(index, index),
employees: Object.assign(employees, employees),
nextNumber: Object.assign(nextNumber, nextNumber),
lines: Object.assign(lines, lines),
records: Object.assign(records, records),
store: Object.assign(store, store),
run: Object.assign(run, run),
hold: Object.assign(hold, hold),
release: Object.assign(release, release),
approve: Object.assign(approve, approve),
finalize: Object.assign(finalize, finalize),
}

export default payroll