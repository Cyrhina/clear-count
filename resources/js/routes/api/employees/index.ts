import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import bulk from './bulk'
import documents from './documents'
/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
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
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
export const show = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/employees/{employee}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
show.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return show.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
show.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
show.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
    const showForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
        showForm.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
        showForm.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\EmployeeController::store
 * @see app/Http/Controllers/EmployeeController.php:66
 * @route '/api/employees'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/employees',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EmployeeController::store
 * @see app/Http/Controllers/EmployeeController.php:66
 * @route '/api/employees'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::store
 * @see app/Http/Controllers/EmployeeController.php:66
 * @route '/api/employees'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EmployeeController::store
 * @see app/Http/Controllers/EmployeeController.php:66
 * @route '/api/employees'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::store
 * @see app/Http/Controllers/EmployeeController.php:66
 * @route '/api/employees'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\EmployeeBulkController::importMethod
 * @see app/Http/Controllers/EmployeeBulkController.php:29
 * @route '/api/employees/import'
 */
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/api/employees/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EmployeeBulkController::importMethod
 * @see app/Http/Controllers/EmployeeBulkController.php:29
 * @route '/api/employees/import'
 */
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeBulkController::importMethod
 * @see app/Http/Controllers/EmployeeBulkController.php:29
 * @route '/api/employees/import'
 */
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EmployeeBulkController::importMethod
 * @see app/Http/Controllers/EmployeeBulkController.php:29
 * @route '/api/employees/import'
 */
    const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: importMethod.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeBulkController::importMethod
 * @see app/Http/Controllers/EmployeeBulkController.php:29
 * @route '/api/employees/import'
 */
        importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: importMethod.url(options),
            method: 'post',
        })
    
    importMethod.form = importMethodForm
/**
* @see \App\Http\Controllers\EmployeeController::personal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
export const personal = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: personal.url(args, options),
    method: 'put',
})

personal.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/personal',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::personal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
personal.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return personal.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::personal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
personal.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: personal.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::personal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
    const personalForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: personal.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::personal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
        personalForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: personal.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    personal.form = personalForm
/**
* @see \App\Http\Controllers\EmployeeController::employment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
export const employment = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: employment.url(args, options),
    method: 'put',
})

employment.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/employment',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::employment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
employment.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return employment.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::employment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
employment.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: employment.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::employment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
    const employmentForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: employment.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::employment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
        employmentForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: employment.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    employment.form = employmentForm
/**
* @see \App\Http\Controllers\EmployeeController::benefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
export const benefits = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: benefits.url(args, options),
    method: 'put',
})

benefits.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/benefits',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::benefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
benefits.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return benefits.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::benefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
benefits.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: benefits.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::benefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
    const benefitsForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: benefits.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::benefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
        benefitsForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: benefits.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    benefits.form = benefitsForm
/**
* @see \App\Http\Controllers\EmployeeController::compensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
export const compensation = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: compensation.url(args, options),
    method: 'put',
})

compensation.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/compensation',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::compensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
compensation.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return compensation.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::compensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
compensation.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: compensation.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::compensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
    const compensationForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: compensation.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::compensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
        compensationForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: compensation.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    compensation.form = compensationForm
/**
* @see \App\Http\Controllers\EmployeeController::government
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
export const government = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: government.url(args, options),
    method: 'put',
})

government.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/government',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::government
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
government.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return government.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::government
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
government.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: government.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::government
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
    const governmentForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: government.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::government
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
        governmentForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: government.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    government.form = governmentForm
/**
* @see \App\Http\Controllers\EmployeeController::bank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
export const bank = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: bank.url(args, options),
    method: 'put',
})

bank.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/bank',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::bank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
bank.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return bank.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::bank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
bank.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: bank.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::bank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
    const bankForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bank.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::bank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
        bankForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bank.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    bank.form = bankForm
/**
* @see \App\Http\Controllers\EmployeeController::status
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
export const status = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: status.url(args, options),
    method: 'put',
})

status.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/status',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::status
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
status.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return status.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::status
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
status.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: status.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::status
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
    const statusForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::status
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
        statusForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    status.form = statusForm
/**
* @see \App\Http\Controllers\EmployeeController::account
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
export const account = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: account.url(args, options),
    method: 'post',
})

account.definition = {
    methods: ["post"],
    url: '/api/employees/{employee}/account',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EmployeeController::account
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
account.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employee: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employee: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return account.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::account
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
account.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: account.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EmployeeController::account
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
    const accountForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: account.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::account
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
        accountForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: account.url(args, options),
            method: 'post',
        })
    
    account.form = accountForm
const employees = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
store: Object.assign(store, store),
import: Object.assign(importMethod, importMethod),
bulk: Object.assign(bulk, bulk),
documents: Object.assign(documents, documents),
personal: Object.assign(personal, personal),
employment: Object.assign(employment, employment),
benefits: Object.assign(benefits, benefits),
compensation: Object.assign(compensation, compensation),
government: Object.assign(government, government),
bank: Object.assign(bank, bank),
status: Object.assign(status, status),
account: Object.assign(account, account),
}

export default employees