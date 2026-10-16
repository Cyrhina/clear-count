import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LeaveController::types
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
export const types = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: types.url(options),
    method: 'get',
})

types.definition = {
    methods: ["get","head"],
    url: '/api/leave/types',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LeaveController::types
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
types.url = (options?: RouteQueryOptions) => {
    return types.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::types
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
types.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: types.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LeaveController::types
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
types.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: types.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LeaveController::types
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
    const typesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: types.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LeaveController::types
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
        typesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: types.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LeaveController::types
 * @see app/Http/Controllers/LeaveController.php:24
 * @route '/api/leave/types'
 */
        typesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: types.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    types.form = typesForm
/**
* @see \App\Http\Controllers\LeaveController::requests
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
export const requests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requests.url(options),
    method: 'get',
})

requests.definition = {
    methods: ["get","head"],
    url: '/api/leave/requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LeaveController::requests
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
requests.url = (options?: RouteQueryOptions) => {
    return requests.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::requests
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
requests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: requests.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LeaveController::requests
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
requests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: requests.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LeaveController::requests
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
    const requestsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: requests.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LeaveController::requests
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
        requestsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: requests.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LeaveController::requests
 * @see app/Http/Controllers/LeaveController.php:65
 * @route '/api/leave/requests'
 */
        requestsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: requests.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    requests.form = requestsForm
/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
export const balances = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: balances.url(options),
    method: 'get',
})

balances.definition = {
    methods: ["get","head"],
    url: '/api/leave/balances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
balances.url = (options?: RouteQueryOptions) => {
    return balances.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
balances.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: balances.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
balances.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: balances.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
    const balancesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: balances.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
        balancesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: balances.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
        balancesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: balances.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    balances.form = balancesForm
/**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
export const preview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/api/leave/requests/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
preview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
    const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: preview.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::preview
 * @see app/Http/Controllers/LeaveController.php:86
 * @route '/api/leave/requests/preview'
 */
        previewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: preview.url(options),
            method: 'post',
        })
    
    preview.form = previewForm
/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/leave/requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::store
 * @see app/Http/Controllers/LeaveController.php:94
 * @route '/api/leave/requests'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
export const cancel = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/api/leave/requests/{leaveRequest}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
cancel.url = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leaveRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { leaveRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    leaveRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        leaveRequest: typeof args.leaveRequest === 'object'
                ? args.leaveRequest.id
                : args.leaveRequest,
                }

    return cancel.definition.url
            .replace('{leaveRequest}', parsedArgs.leaveRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
cancel.post = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
    const cancelForm = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::cancel
 * @see app/Http/Controllers/LeaveController.php:148
 * @route '/api/leave/requests/{leaveRequest}/cancel'
 */
        cancelForm.post = (args: { leaveRequest: number | { id: number } } | [leaveRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
export const decide = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/api/leave/requests/decide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
decide.url = (options?: RouteQueryOptions) => {
    return decide.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
decide.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
    const decideForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decide.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::decide
 * @see app/Http/Controllers/LeaveController.php:116
 * @route '/api/leave/requests/decide'
 */
        decideForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decide.url(options),
            method: 'post',
        })
    
    decide.form = decideForm
/**
* @see \App\Http\Controllers\LeaveController::storeType
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
export const storeType = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeType.url(options),
    method: 'post',
})

storeType.definition = {
    methods: ["post"],
    url: '/api/leave/types',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::storeType
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
storeType.url = (options?: RouteQueryOptions) => {
    return storeType.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::storeType
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
storeType.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeType.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::storeType
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
    const storeTypeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeType.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::storeType
 * @see app/Http/Controllers/LeaveController.php:31
 * @route '/api/leave/types'
 */
        storeTypeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeType.url(options),
            method: 'post',
        })
    
    storeType.form = storeTypeForm
/**
* @see \App\Http\Controllers\LeaveController::updateType
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
export const updateType = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateType.url(args, options),
    method: 'put',
})

updateType.definition = {
    methods: ["put"],
    url: '/api/leave/types/{leaveType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\LeaveController::updateType
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
updateType.url = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leaveType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { leaveType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    leaveType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        leaveType: typeof args.leaveType === 'object'
                ? args.leaveType.id
                : args.leaveType,
                }

    return updateType.definition.url
            .replace('{leaveType}', parsedArgs.leaveType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::updateType
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
updateType.put = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateType.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\LeaveController::updateType
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
    const updateTypeForm = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateType.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::updateType
 * @see app/Http/Controllers/LeaveController.php:39
 * @route '/api/leave/types/{leaveType}'
 */
        updateTypeForm.put = (args: { leaveType: number | { id: number } } | [leaveType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateType.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateType.form = updateTypeForm
/**
* @see \App\Http\Controllers\LeaveController::grantCredits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
export const grantCredits = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: grantCredits.url(options),
    method: 'post',
})

grantCredits.definition = {
    methods: ["post"],
    url: '/api/leave/credits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::grantCredits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
grantCredits.url = (options?: RouteQueryOptions) => {
    return grantCredits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::grantCredits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
grantCredits.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: grantCredits.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::grantCredits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
    const grantCreditsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: grantCredits.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::grantCredits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
        grantCreditsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: grantCredits.url(options),
            method: 'post',
        })
    
    grantCredits.form = grantCreditsForm
const LeaveController = { types, requests, balances, preview, store, cancel, decide, storeType, updateType, grantCredits }

export default LeaveController