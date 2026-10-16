import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollGroupController::index
 * @see app/Http/Controllers/PayrollGroupController.php:25
 * @route '/api/payroll-settings/payroll-groups'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/payroll-groups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollGroupController::index
 * @see app/Http/Controllers/PayrollGroupController.php:25
 * @route '/api/payroll-settings/payroll-groups'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollGroupController::index
 * @see app/Http/Controllers/PayrollGroupController.php:25
 * @route '/api/payroll-settings/payroll-groups'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollGroupController::index
 * @see app/Http/Controllers/PayrollGroupController.php:25
 * @route '/api/payroll-settings/payroll-groups'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollGroupController::index
 * @see app/Http/Controllers/PayrollGroupController.php:25
 * @route '/api/payroll-settings/payroll-groups'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollGroupController::index
 * @see app/Http/Controllers/PayrollGroupController.php:25
 * @route '/api/payroll-settings/payroll-groups'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollGroupController::index
 * @see app/Http/Controllers/PayrollGroupController.php:25
 * @route '/api/payroll-settings/payroll-groups'
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
* @see \App\Http\Controllers\PayrollGroupController::show
 * @see app/Http/Controllers/PayrollGroupController.php:46
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
export const show = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/payroll-groups/{payrollGroup}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollGroupController::show
 * @see app/Http/Controllers/PayrollGroupController.php:46
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
show.url = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payrollGroup: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payrollGroup: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payrollGroup: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payrollGroup: typeof args.payrollGroup === 'object'
                ? args.payrollGroup.id
                : args.payrollGroup,
                }

    return show.definition.url
            .replace('{payrollGroup}', parsedArgs.payrollGroup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollGroupController::show
 * @see app/Http/Controllers/PayrollGroupController.php:46
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
show.get = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollGroupController::show
 * @see app/Http/Controllers/PayrollGroupController.php:46
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
show.head = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollGroupController::show
 * @see app/Http/Controllers/PayrollGroupController.php:46
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
    const showForm = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollGroupController::show
 * @see app/Http/Controllers/PayrollGroupController.php:46
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
        showForm.get = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollGroupController::show
 * @see app/Http/Controllers/PayrollGroupController.php:46
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
        showForm.head = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\PayrollGroupController::store
 * @see app/Http/Controllers/PayrollGroupController.php:53
 * @route '/api/payroll-settings/payroll-groups'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/payroll-groups',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollGroupController::store
 * @see app/Http/Controllers/PayrollGroupController.php:53
 * @route '/api/payroll-settings/payroll-groups'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollGroupController::store
 * @see app/Http/Controllers/PayrollGroupController.php:53
 * @route '/api/payroll-settings/payroll-groups'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollGroupController::store
 * @see app/Http/Controllers/PayrollGroupController.php:53
 * @route '/api/payroll-settings/payroll-groups'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollGroupController::store
 * @see app/Http/Controllers/PayrollGroupController.php:53
 * @route '/api/payroll-settings/payroll-groups'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PayrollGroupController::update
 * @see app/Http/Controllers/PayrollGroupController.php:61
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
export const update = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/payroll-groups/{payrollGroup}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollGroupController::update
 * @see app/Http/Controllers/PayrollGroupController.php:61
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
update.url = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payrollGroup: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payrollGroup: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payrollGroup: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payrollGroup: typeof args.payrollGroup === 'object'
                ? args.payrollGroup.id
                : args.payrollGroup,
                }

    return update.definition.url
            .replace('{payrollGroup}', parsedArgs.payrollGroup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollGroupController::update
 * @see app/Http/Controllers/PayrollGroupController.php:61
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
update.put = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollGroupController::update
 * @see app/Http/Controllers/PayrollGroupController.php:61
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
    const updateForm = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollGroupController::update
 * @see app/Http/Controllers/PayrollGroupController.php:61
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
        updateForm.put = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\PayrollGroupController::destroy
 * @see app/Http/Controllers/PayrollGroupController.php:70
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
export const destroy = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/payroll-groups/{payrollGroup}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollGroupController::destroy
 * @see app/Http/Controllers/PayrollGroupController.php:70
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
destroy.url = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payrollGroup: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payrollGroup: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payrollGroup: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payrollGroup: typeof args.payrollGroup === 'object'
                ? args.payrollGroup.id
                : args.payrollGroup,
                }

    return destroy.definition.url
            .replace('{payrollGroup}', parsedArgs.payrollGroup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollGroupController::destroy
 * @see app/Http/Controllers/PayrollGroupController.php:70
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
destroy.delete = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollGroupController::destroy
 * @see app/Http/Controllers/PayrollGroupController.php:70
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
    const destroyForm = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollGroupController::destroy
 * @see app/Http/Controllers/PayrollGroupController.php:70
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}'
 */
        destroyForm.delete = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\PayrollGroupController::assignEmployees
 * @see app/Http/Controllers/PayrollGroupController.php:89
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/employees'
 */
export const assignEmployees = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignEmployees.url(args, options),
    method: 'post',
})

assignEmployees.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/payroll-groups/{payrollGroup}/employees',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollGroupController::assignEmployees
 * @see app/Http/Controllers/PayrollGroupController.php:89
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/employees'
 */
assignEmployees.url = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payrollGroup: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payrollGroup: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payrollGroup: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payrollGroup: typeof args.payrollGroup === 'object'
                ? args.payrollGroup.id
                : args.payrollGroup,
                }

    return assignEmployees.definition.url
            .replace('{payrollGroup}', parsedArgs.payrollGroup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollGroupController::assignEmployees
 * @see app/Http/Controllers/PayrollGroupController.php:89
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/employees'
 */
assignEmployees.post = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignEmployees.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollGroupController::assignEmployees
 * @see app/Http/Controllers/PayrollGroupController.php:89
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/employees'
 */
    const assignEmployeesForm = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignEmployees.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollGroupController::assignEmployees
 * @see app/Http/Controllers/PayrollGroupController.php:89
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/employees'
 */
        assignEmployeesForm.post = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignEmployees.url(args, options),
            method: 'post',
        })
    
    assignEmployees.form = assignEmployeesForm
/**
* @see \App\Http\Controllers\PayrollGroupController::calendar
 * @see app/Http/Controllers/PayrollGroupController.php:116
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar'
 */
export const calendar = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(args, options),
    method: 'get',
})

calendar.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollGroupController::calendar
 * @see app/Http/Controllers/PayrollGroupController.php:116
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar'
 */
calendar.url = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payrollGroup: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payrollGroup: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payrollGroup: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payrollGroup: typeof args.payrollGroup === 'object'
                ? args.payrollGroup.id
                : args.payrollGroup,
                }

    return calendar.definition.url
            .replace('{payrollGroup}', parsedArgs.payrollGroup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollGroupController::calendar
 * @see app/Http/Controllers/PayrollGroupController.php:116
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar'
 */
calendar.get = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollGroupController::calendar
 * @see app/Http/Controllers/PayrollGroupController.php:116
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar'
 */
calendar.head = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: calendar.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollGroupController::calendar
 * @see app/Http/Controllers/PayrollGroupController.php:116
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar'
 */
    const calendarForm = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: calendar.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollGroupController::calendar
 * @see app/Http/Controllers/PayrollGroupController.php:116
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar'
 */
        calendarForm.get = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: calendar.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollGroupController::calendar
 * @see app/Http/Controllers/PayrollGroupController.php:116
 * @route '/api/payroll-settings/payroll-groups/{payrollGroup}/calendar'
 */
        calendarForm.head = (args: { payrollGroup: number | { id: number } } | [payrollGroup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: calendar.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    calendar.form = calendarForm
const PayrollGroupController = { index, show, store, update, destroy, assignEmployees, calendar }

export default PayrollGroupController