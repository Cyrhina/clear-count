import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/benefits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
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
* @see \App\Http\Controllers\BenefitController::plans
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
export const plans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})

plans.definition = {
    methods: ["get","head"],
    url: '/api/benefits/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BenefitController::plans
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
plans.url = (options?: RouteQueryOptions) => {
    return plans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::plans
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
plans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BenefitController::plans
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
plans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: plans.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BenefitController::plans
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
    const plansForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: plans.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BenefitController::plans
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
        plansForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: plans.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BenefitController::plans
 * @see app/Http/Controllers/BenefitController.php:21
 * @route '/api/benefits/plans'
 */
        plansForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: plans.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    plans.form = plansForm
/**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/benefits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
export const update = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/benefits/{employeeBenefit}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
update.url = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeBenefit: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employeeBenefit: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employeeBenefit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employeeBenefit: typeof args.employeeBenefit === 'object'
                ? args.employeeBenefit.id
                : args.employeeBenefit,
                }

    return update.definition.url
            .replace('{employeeBenefit}', parsedArgs.employeeBenefit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
update.put = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
    const updateForm = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
        updateForm.put = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\BenefitController::storePlan
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
export const storePlan = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePlan.url(options),
    method: 'post',
})

storePlan.definition = {
    methods: ["post"],
    url: '/api/benefits/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::storePlan
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
storePlan.url = (options?: RouteQueryOptions) => {
    return storePlan.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::storePlan
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
storePlan.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePlan.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::storePlan
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
    const storePlanForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storePlan.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::storePlan
 * @see app/Http/Controllers/BenefitController.php:28
 * @route '/api/benefits/plans'
 */
        storePlanForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storePlan.url(options),
            method: 'post',
        })
    
    storePlan.form = storePlanForm
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
* @see \App\Http\Controllers\BenefitController::updatePlan
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
export const updatePlan = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePlan.url(args, options),
    method: 'put',
})

updatePlan.definition = {
    methods: ["put"],
    url: '/api/benefits/plans/{benefitPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BenefitController::updatePlan
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
updatePlan.url = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updatePlan.definition.url
            .replace('{benefitPlan}', parsedArgs.benefitPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::updatePlan
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
updatePlan.put = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePlan.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BenefitController::updatePlan
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
    const updatePlanForm = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePlan.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::updatePlan
 * @see app/Http/Controllers/BenefitController.php:40
 * @route '/api/benefits/plans/{benefitPlan}'
 */
        updatePlanForm.put = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatePlan.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updatePlan.form = updatePlanForm
/**
* @see \App\Http\Controllers\BenefitController::setPlanStatus
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
export const setPlanStatus = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPlanStatus.url(args, options),
    method: 'post',
})

setPlanStatus.definition = {
    methods: ["post"],
    url: '/api/benefits/plans/{benefitPlan}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::setPlanStatus
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
setPlanStatus.url = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return setPlanStatus.definition.url
            .replace('{benefitPlan}', parsedArgs.benefitPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::setPlanStatus
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
setPlanStatus.post = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPlanStatus.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::setPlanStatus
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
    const setPlanStatusForm = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setPlanStatus.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::setPlanStatus
 * @see app/Http/Controllers/BenefitController.php:65
 * @route '/api/benefits/plans/{benefitPlan}/status'
 */
        setPlanStatusForm.post = (args: { benefitPlan: number | { id: number } } | [benefitPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setPlanStatus.url(args, options),
            method: 'post',
        })
    
    setPlanStatus.form = setPlanStatusForm
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
const BenefitController = { index, plans, store, update, storePlan, transfer, updatePlan, setPlanStatus, enroll }

export default BenefitController