import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/deductions/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
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
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/deductions/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\DeductionController::transfer
 * @see app/Http/Controllers/DeductionController.php:154
 * @route '/api/deductions/plans/transfer'
 */
export const transfer = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(options),
    method: 'post',
})

transfer.definition = {
    methods: ["post"],
    url: '/api/deductions/plans/transfer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::transfer
 * @see app/Http/Controllers/DeductionController.php:154
 * @route '/api/deductions/plans/transfer'
 */
transfer.url = (options?: RouteQueryOptions) => {
    return transfer.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::transfer
 * @see app/Http/Controllers/DeductionController.php:154
 * @route '/api/deductions/plans/transfer'
 */
transfer.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::transfer
 * @see app/Http/Controllers/DeductionController.php:154
 * @route '/api/deductions/plans/transfer'
 */
    const transferForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transfer.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::transfer
 * @see app/Http/Controllers/DeductionController.php:154
 * @route '/api/deductions/plans/transfer'
 */
        transferForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: transfer.url(options),
            method: 'post',
        })
    
    transfer.form = transferForm
/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
export const update = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/deductions/plans/{deductionPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
update.url = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deductionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { deductionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    deductionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        deductionPlan: typeof args.deductionPlan === 'object'
                ? args.deductionPlan.id
                : args.deductionPlan,
                }

    return update.definition.url
            .replace('{deductionPlan}', parsedArgs.deductionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
update.put = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
    const updateForm = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
        updateForm.put = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\DeductionController::status
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
export const status = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/api/deductions/plans/{deductionPlan}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::status
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
status.url = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deductionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { deductionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    deductionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        deductionPlan: typeof args.deductionPlan === 'object'
                ? args.deductionPlan.id
                : args.deductionPlan,
                }

    return status.definition.url
            .replace('{deductionPlan}', parsedArgs.deductionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::status
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
status.post = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::status
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
    const statusForm = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::status
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
        statusForm.post = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, options),
            method: 'post',
        })
    
    status.form = statusForm
/**
* @see \App\Http\Controllers\DeductionController::enroll
 * @see app/Http/Controllers/DeductionController.php:118
 * @route '/api/deductions/plans/{deductionPlan}/enroll'
 */
export const enroll = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

enroll.definition = {
    methods: ["post"],
    url: '/api/deductions/plans/{deductionPlan}/enroll',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::enroll
 * @see app/Http/Controllers/DeductionController.php:118
 * @route '/api/deductions/plans/{deductionPlan}/enroll'
 */
enroll.url = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deductionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { deductionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    deductionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        deductionPlan: typeof args.deductionPlan === 'object'
                ? args.deductionPlan.id
                : args.deductionPlan,
                }

    return enroll.definition.url
            .replace('{deductionPlan}', parsedArgs.deductionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::enroll
 * @see app/Http/Controllers/DeductionController.php:118
 * @route '/api/deductions/plans/{deductionPlan}/enroll'
 */
enroll.post = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::enroll
 * @see app/Http/Controllers/DeductionController.php:118
 * @route '/api/deductions/plans/{deductionPlan}/enroll'
 */
    const enrollForm = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enroll.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::enroll
 * @see app/Http/Controllers/DeductionController.php:118
 * @route '/api/deductions/plans/{deductionPlan}/enroll'
 */
        enrollForm.post = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enroll.url(args, options),
            method: 'post',
        })
    
    enroll.form = enrollForm
const plans = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
transfer: Object.assign(transfer, transfer),
update: Object.assign(update, update),
status: Object.assign(status, status),
enroll: Object.assign(enroll, enroll),
}

export default plans