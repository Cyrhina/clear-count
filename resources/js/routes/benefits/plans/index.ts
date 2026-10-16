import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/benefits/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
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
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/benefits/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BenefitController::transfer
 * @see app/Http/Controllers/BenefitController.php:172
 * @route '/api/benefits/plans/transfer'
 */
export const transfer = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(options),
    method: 'post',
})

transfer.definition = {
    methods: ["post"],
    url: '/api/benefits/plans/transfer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::transfer
 * @see app/Http/Controllers/BenefitController.php:172
 * @route '/api/benefits/plans/transfer'
 */
transfer.url = (options?: RouteQueryOptions) => {
    return transfer.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::transfer
 * @see app/Http/Controllers/BenefitController.php:172
 * @route '/api/benefits/plans/transfer'
 */
transfer.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::transfer
 * @see app/Http/Controllers/BenefitController.php:172
 * @route '/api/benefits/plans/transfer'
 */
    const transferForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transfer.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::transfer
 * @see app/Http/Controllers/BenefitController.php:172
 * @route '/api/benefits/plans/transfer'
 */
        transferForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: transfer.url(options),
            method: 'post',
        })
    
    transfer.form = transferForm
/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
export const update = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/benefits/plans/{benefitPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
update.url = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { benefitPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { benefitPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    benefitPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        benefitPlan: typeof args.benefitPlan === 'object'
                ? args.benefitPlan.id
                : args.benefitPlan,
                }

    return update.definition.url
            .replace('{benefitPlan}', parsedArgs.benefitPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
update.put = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
    const updateForm = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
        updateForm.put = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\BenefitController::status
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
export const status = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/api/benefits/plans/{benefitPlan}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::status
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
status.url = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { benefitPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { benefitPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    benefitPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        benefitPlan: typeof args.benefitPlan === 'object'
                ? args.benefitPlan.id
                : args.benefitPlan,
                }

    return status.definition.url
            .replace('{benefitPlan}', parsedArgs.benefitPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::status
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
status.post = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::status
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
    const statusForm = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::status
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
        statusForm.post = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, options),
            method: 'post',
        })
    
    status.form = statusForm
/**
* @see \App\Http\Controllers\BenefitController::enroll
 * @see app/Http/Controllers/BenefitController.php:132
 * @route '/api/benefits/plans/{benefitPlan}/enroll'
 */
export const enroll = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

enroll.definition = {
    methods: ["post"],
    url: '/api/benefits/plans/{benefitPlan}/enroll',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::enroll
 * @see app/Http/Controllers/BenefitController.php:132
 * @route '/api/benefits/plans/{benefitPlan}/enroll'
 */
enroll.url = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { benefitPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { benefitPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    benefitPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        benefitPlan: typeof args.benefitPlan === 'object'
                ? args.benefitPlan.id
                : args.benefitPlan,
                }

    return enroll.definition.url
            .replace('{benefitPlan}', parsedArgs.benefitPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::enroll
 * @see app/Http/Controllers/BenefitController.php:132
 * @route '/api/benefits/plans/{benefitPlan}/enroll'
 */
enroll.post = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::enroll
 * @see app/Http/Controllers/BenefitController.php:132
 * @route '/api/benefits/plans/{benefitPlan}/enroll'
 */
    const enrollForm = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enroll.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::enroll
 * @see app/Http/Controllers/BenefitController.php:132
 * @route '/api/benefits/plans/{benefitPlan}/enroll'
 */
        enrollForm.post = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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