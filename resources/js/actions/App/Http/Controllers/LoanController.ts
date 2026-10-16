import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/loans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
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
* @see \App\Http\Controllers\LoanController::types
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
export const types = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: types.url(options),
    method: 'get',
})

types.definition = {
    methods: ["get","head"],
    url: '/api/loans/types',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LoanController::types
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
types.url = (options?: RouteQueryOptions) => {
    return types.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::types
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
types.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: types.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LoanController::types
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
types.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: types.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LoanController::types
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
    const typesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: types.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LoanController::types
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
        typesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: types.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LoanController::types
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
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
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/loans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LoanController::storeMany
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
export const storeMany = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeMany.url(options),
    method: 'post',
})

storeMany.definition = {
    methods: ["post"],
    url: '/api/loans/bulk',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::storeMany
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
storeMany.url = (options?: RouteQueryOptions) => {
    return storeMany.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::storeMany
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
storeMany.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeMany.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::storeMany
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
    const storeManyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeMany.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::storeMany
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
        storeManyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeMany.url(options),
            method: 'post',
        })
    
    storeMany.form = storeManyForm
/**
* @see \App\Http\Controllers\LoanController::storeType
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
export const storeType = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeType.url(options),
    method: 'post',
})

storeType.definition = {
    methods: ["post"],
    url: '/api/loans/types',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::storeType
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
storeType.url = (options?: RouteQueryOptions) => {
    return storeType.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::storeType
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
storeType.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeType.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::storeType
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
    const storeTypeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeType.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::storeType
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
        storeTypeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeType.url(options),
            method: 'post',
        })
    
    storeType.form = storeTypeForm
/**
* @see \App\Http\Controllers\LoanController::updateType
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
export const updateType = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateType.url(args, options),
    method: 'put',
})

updateType.definition = {
    methods: ["put"],
    url: '/api/loans/types/{loanType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\LoanController::updateType
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
updateType.url = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loanType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loanType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loanType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loanType: typeof args.loanType === 'object'
                ? args.loanType.id
                : args.loanType,
                }

    return updateType.definition.url
            .replace('{loanType}', parsedArgs.loanType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::updateType
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
updateType.put = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateType.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\LoanController::updateType
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
    const updateTypeForm = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateType.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::updateType
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
        updateTypeForm.put = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\LoanController::destroyType
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
export const destroyType = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyType.url(args, options),
    method: 'delete',
})

destroyType.definition = {
    methods: ["delete"],
    url: '/api/loans/types/{loanType}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LoanController::destroyType
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
destroyType.url = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loanType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loanType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loanType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loanType: typeof args.loanType === 'object'
                ? args.loanType.id
                : args.loanType,
                }

    return destroyType.definition.url
            .replace('{loanType}', parsedArgs.loanType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::destroyType
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
destroyType.delete = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyType.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LoanController::destroyType
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
    const destroyTypeForm = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyType.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::destroyType
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
        destroyTypeForm.delete = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyType.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyType.form = destroyTypeForm
/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
export const update = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/loans/{loan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
update.url = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loan: typeof args.loan === 'object'
                ? args.loan.id
                : args.loan,
                }

    return update.definition.url
            .replace('{loan}', parsedArgs.loan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
update.put = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
    const updateForm = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
        updateForm.put = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\LoanController::setStatus
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
export const setStatus = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setStatus.url(args, options),
    method: 'post',
})

setStatus.definition = {
    methods: ["post"],
    url: '/api/loans/{loan}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::setStatus
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
setStatus.url = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loan: typeof args.loan === 'object'
                ? args.loan.id
                : args.loan,
                }

    return setStatus.definition.url
            .replace('{loan}', parsedArgs.loan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::setStatus
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
setStatus.post = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setStatus.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::setStatus
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
    const setStatusForm = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setStatus.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::setStatus
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
        setStatusForm.post = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setStatus.url(args, options),
            method: 'post',
        })
    
    setStatus.form = setStatusForm
const LoanController = { index, types, store, storeMany, storeType, updateType, destroyType, update, setStatus }

export default LoanController