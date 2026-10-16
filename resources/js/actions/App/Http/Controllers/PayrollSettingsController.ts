import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollSettingsController::earnings
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
export const earnings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})

earnings.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/earnings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::earnings
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
earnings.url = (options?: RouteQueryOptions) => {
    return earnings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::earnings
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
earnings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::earnings
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
earnings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: earnings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::earnings
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
    const earningsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: earnings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::earnings
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
        earningsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: earnings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::earnings
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
        earningsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: earnings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    earnings.form = earningsForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::storeEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
export const storeEarning = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeEarning.url(options),
    method: 'post',
})

storeEarning.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/earnings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
storeEarning.url = (options?: RouteQueryOptions) => {
    return storeEarning.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
storeEarning.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeEarning.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::storeEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
    const storeEarningForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeEarning.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::storeEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
        storeEarningForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeEarning.url(options),
            method: 'post',
        })
    
    storeEarning.form = storeEarningForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::updateEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
export const updateEarning = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateEarning.url(args, options),
    method: 'put',
})

updateEarning.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/earnings/{earningType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
updateEarning.url = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { earningType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { earningType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    earningType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        earningType: typeof args.earningType === 'object'
                ? args.earningType.id
                : args.earningType,
                }

    return updateEarning.definition.url
            .replace('{earningType}', parsedArgs.earningType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
updateEarning.put = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateEarning.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::updateEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
    const updateEarningForm = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateEarning.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::updateEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
        updateEarningForm.put = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateEarning.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateEarning.form = updateEarningForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
export const destroyEarning = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyEarning.url(args, options),
    method: 'delete',
})

destroyEarning.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/earnings/{earningType}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
destroyEarning.url = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { earningType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { earningType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    earningType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        earningType: typeof args.earningType === 'object'
                ? args.earningType.id
                : args.earningType,
                }

    return destroyEarning.definition.url
            .replace('{earningType}', parsedArgs.earningType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
destroyEarning.delete = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyEarning.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
    const destroyEarningForm = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyEarning.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyEarning
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
        destroyEarningForm.delete = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyEarning.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyEarning.form = destroyEarningForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::deductions
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
export const deductions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deductions.url(options),
    method: 'get',
})

deductions.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/deductions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::deductions
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
deductions.url = (options?: RouteQueryOptions) => {
    return deductions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::deductions
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
deductions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deductions.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::deductions
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
deductions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deductions.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::deductions
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
    const deductionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: deductions.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::deductions
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
        deductionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deductions.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::deductions
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
        deductionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deductions.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    deductions.form = deductionsForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::storeDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
export const storeDeduction = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeDeduction.url(options),
    method: 'post',
})

storeDeduction.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/deductions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
storeDeduction.url = (options?: RouteQueryOptions) => {
    return storeDeduction.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
storeDeduction.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeDeduction.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::storeDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
    const storeDeductionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeDeduction.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::storeDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
        storeDeductionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeDeduction.url(options),
            method: 'post',
        })
    
    storeDeduction.form = storeDeductionForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::updateDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
export const updateDeduction = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateDeduction.url(args, options),
    method: 'put',
})

updateDeduction.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/deductions/{deductionType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
updateDeduction.url = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deductionType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { deductionType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    deductionType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        deductionType: typeof args.deductionType === 'object'
                ? args.deductionType.id
                : args.deductionType,
                }

    return updateDeduction.definition.url
            .replace('{deductionType}', parsedArgs.deductionType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
updateDeduction.put = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateDeduction.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::updateDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
    const updateDeductionForm = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateDeduction.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::updateDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
        updateDeductionForm.put = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateDeduction.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateDeduction.form = updateDeductionForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
export const destroyDeduction = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyDeduction.url(args, options),
    method: 'delete',
})

destroyDeduction.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/deductions/{deductionType}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
destroyDeduction.url = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deductionType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { deductionType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    deductionType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        deductionType: typeof args.deductionType === 'object'
                ? args.deductionType.id
                : args.deductionType,
                }

    return destroyDeduction.definition.url
            .replace('{deductionType}', parsedArgs.deductionType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
destroyDeduction.delete = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyDeduction.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
    const destroyDeductionForm = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyDeduction.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyDeduction
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
        destroyDeductionForm.delete = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyDeduction.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyDeduction.form = destroyDeductionForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::overtimeRates
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
export const overtimeRates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtimeRates.url(options),
    method: 'get',
})

overtimeRates.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/overtime-rates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::overtimeRates
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
overtimeRates.url = (options?: RouteQueryOptions) => {
    return overtimeRates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::overtimeRates
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
overtimeRates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtimeRates.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::overtimeRates
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
overtimeRates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overtimeRates.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::overtimeRates
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
    const overtimeRatesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: overtimeRates.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::overtimeRates
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
        overtimeRatesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overtimeRates.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::overtimeRates
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
        overtimeRatesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overtimeRates.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    overtimeRates.form = overtimeRatesForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::storeOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
export const storeOvertimeRate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeOvertimeRate.url(options),
    method: 'post',
})

storeOvertimeRate.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/overtime-rates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
storeOvertimeRate.url = (options?: RouteQueryOptions) => {
    return storeOvertimeRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
storeOvertimeRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeOvertimeRate.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::storeOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
    const storeOvertimeRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeOvertimeRate.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::storeOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
        storeOvertimeRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeOvertimeRate.url(options),
            method: 'post',
        })
    
    storeOvertimeRate.form = storeOvertimeRateForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::updateOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
export const updateOvertimeRate = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateOvertimeRate.url(args, options),
    method: 'put',
})

updateOvertimeRate.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/overtime-rates/{overtimeRate}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
updateOvertimeRate.url = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtimeRate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { overtimeRate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    overtimeRate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        overtimeRate: typeof args.overtimeRate === 'object'
                ? args.overtimeRate.id
                : args.overtimeRate,
                }

    return updateOvertimeRate.definition.url
            .replace('{overtimeRate}', parsedArgs.overtimeRate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
updateOvertimeRate.put = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateOvertimeRate.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::updateOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
    const updateOvertimeRateForm = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateOvertimeRate.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::updateOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
        updateOvertimeRateForm.put = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateOvertimeRate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateOvertimeRate.form = updateOvertimeRateForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
export const destroyOvertimeRate = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyOvertimeRate.url(args, options),
    method: 'delete',
})

destroyOvertimeRate.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/overtime-rates/{overtimeRate}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
destroyOvertimeRate.url = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtimeRate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { overtimeRate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    overtimeRate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        overtimeRate: typeof args.overtimeRate === 'object'
                ? args.overtimeRate.id
                : args.overtimeRate,
                }

    return destroyOvertimeRate.definition.url
            .replace('{overtimeRate}', parsedArgs.overtimeRate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
destroyOvertimeRate.delete = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyOvertimeRate.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
    const destroyOvertimeRateForm = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyOvertimeRate.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyOvertimeRate
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
        destroyOvertimeRateForm.delete = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyOvertimeRate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyOvertimeRate.form = destroyOvertimeRateForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::rules
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
export const rules = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rules.url(options),
    method: 'get',
})

rules.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/rules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::rules
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
rules.url = (options?: RouteQueryOptions) => {
    return rules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::rules
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
rules.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rules.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::rules
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
rules.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: rules.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::rules
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
    const rulesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: rules.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::rules
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
        rulesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: rules.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::rules
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
        rulesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: rules.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    rules.form = rulesForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::updateRules
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
export const updateRules = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRules.url(options),
    method: 'put',
})

updateRules.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/rules',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateRules
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
updateRules.url = (options?: RouteQueryOptions) => {
    return updateRules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateRules
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
updateRules.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRules.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::updateRules
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
    const updateRulesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateRules.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::updateRules
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
        updateRulesForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateRules.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateRules.form = updateRulesForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::workSchedules
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
export const workSchedules = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workSchedules.url(options),
    method: 'get',
})

workSchedules.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/work-schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::workSchedules
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
workSchedules.url = (options?: RouteQueryOptions) => {
    return workSchedules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::workSchedules
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
workSchedules.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workSchedules.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::workSchedules
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
workSchedules.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: workSchedules.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::workSchedules
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
    const workSchedulesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: workSchedules.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::workSchedules
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
        workSchedulesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workSchedules.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::workSchedules
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
        workSchedulesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workSchedules.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    workSchedules.form = workSchedulesForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::storeWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
export const storeWorkSchedule = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWorkSchedule.url(options),
    method: 'post',
})

storeWorkSchedule.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/work-schedules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
storeWorkSchedule.url = (options?: RouteQueryOptions) => {
    return storeWorkSchedule.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::storeWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
storeWorkSchedule.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWorkSchedule.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::storeWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
    const storeWorkScheduleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeWorkSchedule.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::storeWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
        storeWorkScheduleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeWorkSchedule.url(options),
            method: 'post',
        })
    
    storeWorkSchedule.form = storeWorkScheduleForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::updateWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
export const updateWorkSchedule = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateWorkSchedule.url(args, options),
    method: 'put',
})

updateWorkSchedule.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/work-schedules/{workSchedule}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
updateWorkSchedule.url = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workSchedule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workSchedule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workSchedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workSchedule: typeof args.workSchedule === 'object'
                ? args.workSchedule.id
                : args.workSchedule,
                }

    return updateWorkSchedule.definition.url
            .replace('{workSchedule}', parsedArgs.workSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::updateWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
updateWorkSchedule.put = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateWorkSchedule.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::updateWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
    const updateWorkScheduleForm = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateWorkSchedule.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::updateWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
        updateWorkScheduleForm.put = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateWorkSchedule.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateWorkSchedule.form = updateWorkScheduleForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
export const destroyWorkSchedule = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWorkSchedule.url(args, options),
    method: 'delete',
})

destroyWorkSchedule.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/work-schedules/{workSchedule}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
destroyWorkSchedule.url = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workSchedule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workSchedule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workSchedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workSchedule: typeof args.workSchedule === 'object'
                ? args.workSchedule.id
                : args.workSchedule,
                }

    return destroyWorkSchedule.definition.url
            .replace('{workSchedule}', parsedArgs.workSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroyWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
destroyWorkSchedule.delete = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWorkSchedule.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
    const destroyWorkScheduleForm = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyWorkSchedule.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::destroyWorkSchedule
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
        destroyWorkScheduleForm.delete = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyWorkSchedule.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyWorkSchedule.form = destroyWorkScheduleForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::assignWorkScheduleEmployees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
export const assignWorkScheduleEmployees = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignWorkScheduleEmployees.url(args, options),
    method: 'post',
})

assignWorkScheduleEmployees.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/work-schedules/{workSchedule}/employees',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::assignWorkScheduleEmployees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
assignWorkScheduleEmployees.url = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workSchedule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workSchedule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workSchedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workSchedule: typeof args.workSchedule === 'object'
                ? args.workSchedule.id
                : args.workSchedule,
                }

    return assignWorkScheduleEmployees.definition.url
            .replace('{workSchedule}', parsedArgs.workSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::assignWorkScheduleEmployees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
assignWorkScheduleEmployees.post = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignWorkScheduleEmployees.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::assignWorkScheduleEmployees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
    const assignWorkScheduleEmployeesForm = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignWorkScheduleEmployees.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::assignWorkScheduleEmployees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
        assignWorkScheduleEmployeesForm.post = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignWorkScheduleEmployees.url(args, options),
            method: 'post',
        })
    
    assignWorkScheduleEmployees.form = assignWorkScheduleEmployeesForm
const PayrollSettingsController = { earnings, storeEarning, updateEarning, destroyEarning, deductions, storeDeduction, updateDeduction, destroyDeduction, overtimeRates, storeOvertimeRate, updateOvertimeRate, destroyOvertimeRate, rules, updateRules, workSchedules, storeWorkSchedule, updateWorkSchedule, destroyWorkSchedule, assignWorkScheduleEmployees }

export default PayrollSettingsController