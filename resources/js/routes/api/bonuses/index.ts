import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import payslips8176aa from './payslips'
/**
* @see \App\Http\Controllers\BonusController::index
 * @see app/Http/Controllers/BonusController.php:18
 * @route '/api/bonuses'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/bonuses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BonusController::index
 * @see app/Http/Controllers/BonusController.php:18
 * @route '/api/bonuses'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusController::index
 * @see app/Http/Controllers/BonusController.php:18
 * @route '/api/bonuses'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BonusController::index
 * @see app/Http/Controllers/BonusController.php:18
 * @route '/api/bonuses'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BonusController::index
 * @see app/Http/Controllers/BonusController.php:18
 * @route '/api/bonuses'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BonusController::index
 * @see app/Http/Controllers/BonusController.php:18
 * @route '/api/bonuses'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BonusController::index
 * @see app/Http/Controllers/BonusController.php:18
 * @route '/api/bonuses'
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
* @see \App\Http\Controllers\BonusPayslipController::payslips
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
export const payslips = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslips.url(args, options),
    method: 'get',
})

payslips.definition = {
    methods: ["get","head"],
    url: '/api/bonuses/{bonus}/payslips',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BonusPayslipController::payslips
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
payslips.url = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { bonus: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { bonus: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    bonus: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonus: typeof args.bonus === 'object'
                ? args.bonus.id
                : args.bonus,
                }

    return payslips.definition.url
            .replace('{bonus}', parsedArgs.bonus.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusPayslipController::payslips
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
payslips.get = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslips.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BonusPayslipController::payslips
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
payslips.head = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payslips.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BonusPayslipController::payslips
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
    const payslipsForm = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payslips.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BonusPayslipController::payslips
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
        payslipsForm.get = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslips.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BonusPayslipController::payslips
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
        payslipsForm.head = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslips.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payslips.form = payslipsForm
/**
* @see \App\Http\Controllers\BonusController::store
 * @see app/Http/Controllers/BonusController.php:23
 * @route '/api/bonuses'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/bonuses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BonusController::store
 * @see app/Http/Controllers/BonusController.php:23
 * @route '/api/bonuses'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusController::store
 * @see app/Http/Controllers/BonusController.php:23
 * @route '/api/bonuses'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BonusController::store
 * @see app/Http/Controllers/BonusController.php:23
 * @route '/api/bonuses'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BonusController::store
 * @see app/Http/Controllers/BonusController.php:23
 * @route '/api/bonuses'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BonusController::update
 * @see app/Http/Controllers/BonusController.php:33
 * @route '/api/bonuses/{bonus}'
 */
export const update = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/bonuses/{bonus}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BonusController::update
 * @see app/Http/Controllers/BonusController.php:33
 * @route '/api/bonuses/{bonus}'
 */
update.url = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { bonus: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { bonus: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    bonus: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonus: typeof args.bonus === 'object'
                ? args.bonus.id
                : args.bonus,
                }

    return update.definition.url
            .replace('{bonus}', parsedArgs.bonus.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusController::update
 * @see app/Http/Controllers/BonusController.php:33
 * @route '/api/bonuses/{bonus}'
 */
update.put = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BonusController::update
 * @see app/Http/Controllers/BonusController.php:33
 * @route '/api/bonuses/{bonus}'
 */
    const updateForm = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BonusController::update
 * @see app/Http/Controllers/BonusController.php:33
 * @route '/api/bonuses/{bonus}'
 */
        updateForm.put = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\BonusController::submit
 * @see app/Http/Controllers/BonusController.php:44
 * @route '/api/bonuses/{bonus}/submit'
 */
export const submit = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/api/bonuses/{bonus}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BonusController::submit
 * @see app/Http/Controllers/BonusController.php:44
 * @route '/api/bonuses/{bonus}/submit'
 */
submit.url = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { bonus: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { bonus: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    bonus: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonus: typeof args.bonus === 'object'
                ? args.bonus.id
                : args.bonus,
                }

    return submit.definition.url
            .replace('{bonus}', parsedArgs.bonus.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusController::submit
 * @see app/Http/Controllers/BonusController.php:44
 * @route '/api/bonuses/{bonus}/submit'
 */
submit.post = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BonusController::submit
 * @see app/Http/Controllers/BonusController.php:44
 * @route '/api/bonuses/{bonus}/submit'
 */
    const submitForm = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BonusController::submit
 * @see app/Http/Controllers/BonusController.php:44
 * @route '/api/bonuses/{bonus}/submit'
 */
        submitForm.post = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
/**
* @see \App\Http\Controllers\BonusController::decide
 * @see app/Http/Controllers/BonusController.php:55
 * @route '/api/bonuses/{bonus}/decision'
 */
export const decide = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(args, options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/api/bonuses/{bonus}/decision',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BonusController::decide
 * @see app/Http/Controllers/BonusController.php:55
 * @route '/api/bonuses/{bonus}/decision'
 */
decide.url = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { bonus: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { bonus: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    bonus: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonus: typeof args.bonus === 'object'
                ? args.bonus.id
                : args.bonus,
                }

    return decide.definition.url
            .replace('{bonus}', parsedArgs.bonus.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusController::decide
 * @see app/Http/Controllers/BonusController.php:55
 * @route '/api/bonuses/{bonus}/decision'
 */
decide.post = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BonusController::decide
 * @see app/Http/Controllers/BonusController.php:55
 * @route '/api/bonuses/{bonus}/decision'
 */
    const decideForm = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decide.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BonusController::decide
 * @see app/Http/Controllers/BonusController.php:55
 * @route '/api/bonuses/{bonus}/decision'
 */
        decideForm.post = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decide.url(args, options),
            method: 'post',
        })
    
    decide.form = decideForm
const bonuses = {
    index: Object.assign(index, index),
payslips: Object.assign(payslips, payslips8176aa),
store: Object.assign(store, store),
update: Object.assign(update, update),
submit: Object.assign(submit, submit),
decide: Object.assign(decide, decide),
}

export default bonuses