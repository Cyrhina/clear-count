import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/v1/employees'
 */
const indexe52a29d8365e38fe4b22b98347809557 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexe52a29d8365e38fe4b22b98347809557.url(options),
    method: 'get',
})

indexe52a29d8365e38fe4b22b98347809557.definition = {
    methods: ["get","head"],
    url: '/api/v1/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/v1/employees'
 */
indexe52a29d8365e38fe4b22b98347809557.url = (options?: RouteQueryOptions) => {
    return indexe52a29d8365e38fe4b22b98347809557.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/v1/employees'
 */
indexe52a29d8365e38fe4b22b98347809557.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexe52a29d8365e38fe4b22b98347809557.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/v1/employees'
 */
indexe52a29d8365e38fe4b22b98347809557.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexe52a29d8365e38fe4b22b98347809557.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/v1/employees'
 */
    const indexe52a29d8365e38fe4b22b98347809557Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexe52a29d8365e38fe4b22b98347809557.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/v1/employees'
 */
        indexe52a29d8365e38fe4b22b98347809557Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexe52a29d8365e38fe4b22b98347809557.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/v1/employees'
 */
        indexe52a29d8365e38fe4b22b98347809557Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexe52a29d8365e38fe4b22b98347809557.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexe52a29d8365e38fe4b22b98347809557.form = indexe52a29d8365e38fe4b22b98347809557Form
    /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
const indexf2b2bdcf5f4b893ca7ad83945da6ec52 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf2b2bdcf5f4b893ca7ad83945da6ec52.url(options),
    method: 'get',
})

indexf2b2bdcf5f4b893ca7ad83945da6ec52.definition = {
    methods: ["get","head"],
    url: '/api/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
indexf2b2bdcf5f4b893ca7ad83945da6ec52.url = (options?: RouteQueryOptions) => {
    return indexf2b2bdcf5f4b893ca7ad83945da6ec52.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
indexf2b2bdcf5f4b893ca7ad83945da6ec52.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf2b2bdcf5f4b893ca7ad83945da6ec52.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
indexf2b2bdcf5f4b893ca7ad83945da6ec52.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexf2b2bdcf5f4b893ca7ad83945da6ec52.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
    const indexf2b2bdcf5f4b893ca7ad83945da6ec52Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexf2b2bdcf5f4b893ca7ad83945da6ec52.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
        indexf2b2bdcf5f4b893ca7ad83945da6ec52Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexf2b2bdcf5f4b893ca7ad83945da6ec52.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EmployeeController::index
 * @see app/Http/Controllers/EmployeeController.php:35
 * @route '/api/employees'
 */
        indexf2b2bdcf5f4b893ca7ad83945da6ec52Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexf2b2bdcf5f4b893ca7ad83945da6ec52.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexf2b2bdcf5f4b893ca7ad83945da6ec52.form = indexf2b2bdcf5f4b893ca7ad83945da6ec52Form

/**
* Multiple routes resolve to \App\Http\Controllers\EmployeeController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/v1/employees': indexe52a29d8365e38fe4b22b98347809557,
    '/api/employees': indexf2b2bdcf5f4b893ca7ad83945da6ec52,
}

/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/v1/employees/{employee}'
 */
const showb5b285b87c4e81ab607e63e320995896 = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showb5b285b87c4e81ab607e63e320995896.url(args, options),
    method: 'get',
})

showb5b285b87c4e81ab607e63e320995896.definition = {
    methods: ["get","head"],
    url: '/api/v1/employees/{employee}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/v1/employees/{employee}'
 */
showb5b285b87c4e81ab607e63e320995896.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return showb5b285b87c4e81ab607e63e320995896.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/v1/employees/{employee}'
 */
showb5b285b87c4e81ab607e63e320995896.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showb5b285b87c4e81ab607e63e320995896.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/v1/employees/{employee}'
 */
showb5b285b87c4e81ab607e63e320995896.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showb5b285b87c4e81ab607e63e320995896.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/v1/employees/{employee}'
 */
    const showb5b285b87c4e81ab607e63e320995896Form = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showb5b285b87c4e81ab607e63e320995896.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/v1/employees/{employee}'
 */
        showb5b285b87c4e81ab607e63e320995896Form.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showb5b285b87c4e81ab607e63e320995896.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/v1/employees/{employee}'
 */
        showb5b285b87c4e81ab607e63e320995896Form.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showb5b285b87c4e81ab607e63e320995896.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showb5b285b87c4e81ab607e63e320995896.form = showb5b285b87c4e81ab607e63e320995896Form
    /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
const showe4acf3b6450ba82d81e7fa5d9f1a3bf0 = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showe4acf3b6450ba82d81e7fa5d9f1a3bf0.url(args, options),
    method: 'get',
})

showe4acf3b6450ba82d81e7fa5d9f1a3bf0.definition = {
    methods: ["get","head"],
    url: '/api/employees/{employee}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
showe4acf3b6450ba82d81e7fa5d9f1a3bf0.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return showe4acf3b6450ba82d81e7fa5d9f1a3bf0.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
showe4acf3b6450ba82d81e7fa5d9f1a3bf0.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showe4acf3b6450ba82d81e7fa5d9f1a3bf0.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
showe4acf3b6450ba82d81e7fa5d9f1a3bf0.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showe4acf3b6450ba82d81e7fa5d9f1a3bf0.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
    const showe4acf3b6450ba82d81e7fa5d9f1a3bf0Form = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showe4acf3b6450ba82d81e7fa5d9f1a3bf0.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
        showe4acf3b6450ba82d81e7fa5d9f1a3bf0Form.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showe4acf3b6450ba82d81e7fa5d9f1a3bf0.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\EmployeeController::show
 * @see app/Http/Controllers/EmployeeController.php:61
 * @route '/api/employees/{employee}'
 */
        showe4acf3b6450ba82d81e7fa5d9f1a3bf0Form.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showe4acf3b6450ba82d81e7fa5d9f1a3bf0.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showe4acf3b6450ba82d81e7fa5d9f1a3bf0.form = showe4acf3b6450ba82d81e7fa5d9f1a3bf0Form

/**
* Multiple routes resolve to \App\Http\Controllers\EmployeeController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/v1/employees/{employee}': showb5b285b87c4e81ab607e63e320995896,
    '/api/employees/{employee}': showe4acf3b6450ba82d81e7fa5d9f1a3bf0,
}

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
* @see \App\Http\Controllers\EmployeeController::updatePersonal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
export const updatePersonal = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePersonal.url(args, options),
    method: 'put',
})

updatePersonal.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/personal',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::updatePersonal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
updatePersonal.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updatePersonal.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::updatePersonal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
updatePersonal.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePersonal.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::updatePersonal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
    const updatePersonalForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePersonal.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::updatePersonal
 * @see app/Http/Controllers/EmployeeController.php:74
 * @route '/api/employees/{employee}/personal'
 */
        updatePersonalForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatePersonal.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatePersonal.form = updatePersonalForm
/**
* @see \App\Http\Controllers\EmployeeController::updateEmployment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
export const updateEmployment = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateEmployment.url(args, options),
    method: 'put',
})

updateEmployment.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/employment',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::updateEmployment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
updateEmployment.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateEmployment.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::updateEmployment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
updateEmployment.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateEmployment.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::updateEmployment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
    const updateEmploymentForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateEmployment.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::updateEmployment
 * @see app/Http/Controllers/EmployeeController.php:82
 * @route '/api/employees/{employee}/employment'
 */
        updateEmploymentForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateEmployment.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateEmployment.form = updateEmploymentForm
/**
* @see \App\Http\Controllers\EmployeeController::updateBenefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
export const updateBenefits = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBenefits.url(args, options),
    method: 'put',
})

updateBenefits.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/benefits',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::updateBenefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
updateBenefits.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateBenefits.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::updateBenefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
updateBenefits.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBenefits.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::updateBenefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
    const updateBenefitsForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateBenefits.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::updateBenefits
 * @see app/Http/Controllers/EmployeeController.php:102
 * @route '/api/employees/{employee}/benefits'
 */
        updateBenefitsForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateBenefits.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateBenefits.form = updateBenefitsForm
/**
* @see \App\Http\Controllers\EmployeeController::updateCompensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
export const updateCompensation = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCompensation.url(args, options),
    method: 'put',
})

updateCompensation.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/compensation',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::updateCompensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
updateCompensation.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateCompensation.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::updateCompensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
updateCompensation.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCompensation.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::updateCompensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
    const updateCompensationForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateCompensation.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::updateCompensation
 * @see app/Http/Controllers/EmployeeController.php:121
 * @route '/api/employees/{employee}/compensation'
 */
        updateCompensationForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateCompensation.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateCompensation.form = updateCompensationForm
/**
* @see \App\Http\Controllers\EmployeeController::updateGovernment
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
export const updateGovernment = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateGovernment.url(args, options),
    method: 'put',
})

updateGovernment.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/government',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::updateGovernment
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
updateGovernment.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateGovernment.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::updateGovernment
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
updateGovernment.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateGovernment.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::updateGovernment
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
    const updateGovernmentForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateGovernment.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::updateGovernment
 * @see app/Http/Controllers/EmployeeController.php:149
 * @route '/api/employees/{employee}/government'
 */
        updateGovernmentForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateGovernment.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateGovernment.form = updateGovernmentForm
/**
* @see \App\Http\Controllers\EmployeeController::updateBank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
export const updateBank = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBank.url(args, options),
    method: 'put',
})

updateBank.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/bank',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::updateBank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
updateBank.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateBank.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::updateBank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
updateBank.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBank.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::updateBank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
    const updateBankForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateBank.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::updateBank
 * @see app/Http/Controllers/EmployeeController.php:156
 * @route '/api/employees/{employee}/bank'
 */
        updateBankForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateBank.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateBank.form = updateBankForm
/**
* @see \App\Http\Controllers\EmployeeController::updateStatus
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
export const updateStatus = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStatus.url(args, options),
    method: 'put',
})

updateStatus.definition = {
    methods: ["put"],
    url: '/api/employees/{employee}/status',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EmployeeController::updateStatus
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
updateStatus.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateStatus.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::updateStatus
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
updateStatus.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStatus.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\EmployeeController::updateStatus
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
    const updateStatusForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::updateStatus
 * @see app/Http/Controllers/EmployeeController.php:167
 * @route '/api/employees/{employee}/status'
 */
        updateStatusForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStatus.form = updateStatusForm
/**
* @see \App\Http\Controllers\EmployeeController::createAccount
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
export const createAccount = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createAccount.url(args, options),
    method: 'post',
})

createAccount.definition = {
    methods: ["post"],
    url: '/api/employees/{employee}/account',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EmployeeController::createAccount
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
createAccount.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return createAccount.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeController::createAccount
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
createAccount.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createAccount.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EmployeeController::createAccount
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
    const createAccountForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createAccount.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeController::createAccount
 * @see app/Http/Controllers/EmployeeController.php:201
 * @route '/api/employees/{employee}/account'
 */
        createAccountForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createAccount.url(args, options),
            method: 'post',
        })
    
    createAccount.form = createAccountForm
const EmployeeController = { index, show, store, updatePersonal, updateEmployment, updateBenefits, updateCompensation, updateGovernment, updateBank, updateStatus, createAccount }

export default EmployeeController