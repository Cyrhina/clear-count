import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/deductions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
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
* @see \App\Http\Controllers\DeductionController::plans
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
export const plans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})

plans.definition = {
    methods: ["get","head"],
    url: '/api/deductions/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DeductionController::plans
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
plans.url = (options?: RouteQueryOptions) => {
    return plans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::plans
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
plans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DeductionController::plans
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
plans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: plans.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DeductionController::plans
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
    const plansForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: plans.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DeductionController::plans
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
 */
        plansForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: plans.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DeductionController::plans
 * @see app/Http/Controllers/DeductionController.php:19
 * @route '/api/deductions/plans'
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
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/deductions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
export const update = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/deductions/{employeeDeduction}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
update.url = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeDeduction: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employeeDeduction: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employeeDeduction: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employeeDeduction: typeof args.employeeDeduction === 'object'
                ? args.employeeDeduction.id
                : args.employeeDeduction,
                }

    return update.definition.url
            .replace('{employeeDeduction}', parsedArgs.employeeDeduction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
update.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
    const updateForm = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
        updateForm.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\DeductionController::storePlan
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
export const storePlan = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePlan.url(options),
    method: 'post',
})

storePlan.definition = {
    methods: ["post"],
    url: '/api/deductions/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::storePlan
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
storePlan.url = (options?: RouteQueryOptions) => {
    return storePlan.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::storePlan
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
storePlan.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePlan.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::storePlan
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
    const storePlanForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storePlan.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::storePlan
 * @see app/Http/Controllers/DeductionController.php:24
 * @route '/api/deductions/plans'
 */
        storePlanForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storePlan.url(options),
            method: 'post',
        })
    
    storePlan.form = storePlanForm
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
* @see \App\Http\Controllers\DeductionController::updatePlan
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
export const updatePlan = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePlan.url(args, options),
    method: 'put',
})

updatePlan.definition = {
    methods: ["put"],
    url: '/api/deductions/plans/{deductionPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DeductionController::updatePlan
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
updatePlan.url = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updatePlan.definition.url
            .replace('{deductionPlan}', parsedArgs.deductionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::updatePlan
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
updatePlan.put = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePlan.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DeductionController::updatePlan
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
    const updatePlanForm = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePlan.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::updatePlan
 * @see app/Http/Controllers/DeductionController.php:36
 * @route '/api/deductions/plans/{deductionPlan}'
 */
        updatePlanForm.put = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\DeductionController::setPlanStatus
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
export const setPlanStatus = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPlanStatus.url(args, options),
    method: 'post',
})

setPlanStatus.definition = {
    methods: ["post"],
    url: '/api/deductions/plans/{deductionPlan}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::setPlanStatus
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
setPlanStatus.url = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return setPlanStatus.definition.url
            .replace('{deductionPlan}', parsedArgs.deductionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::setPlanStatus
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
setPlanStatus.post = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPlanStatus.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::setPlanStatus
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
    const setPlanStatusForm = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setPlanStatus.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::setPlanStatus
 * @see app/Http/Controllers/DeductionController.php:57
 * @route '/api/deductions/plans/{deductionPlan}/status'
 */
        setPlanStatusForm.post = (args: { deductionPlan: number | { id: number } } | [deductionPlan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setPlanStatus.url(args, options),
            method: 'post',
        })
    
    setPlanStatus.form = setPlanStatusForm
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
const DeductionController = { index, plans, store, update, storePlan, transfer, updatePlan, setPlanStatus, enroll }

export default DeductionController