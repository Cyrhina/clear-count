import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/api/platform/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\PlatformController::companies
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
export const companies = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companies.url(options),
    method: 'get',
})

companies.definition = {
    methods: ["get","head"],
    url: '/api/platform/companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlatformController::companies
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
companies.url = (options?: RouteQueryOptions) => {
    return companies.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::companies
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
companies.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companies.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PlatformController::companies
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
companies.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: companies.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PlatformController::companies
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
    const companiesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: companies.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PlatformController::companies
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
        companiesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companies.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PlatformController::companies
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
        companiesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companies.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    companies.form = companiesForm
/**
* @see \App\Http\Controllers\PlatformController::storeCompany
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
export const storeCompany = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCompany.url(options),
    method: 'post',
})

storeCompany.definition = {
    methods: ["post"],
    url: '/api/platform/companies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlatformController::storeCompany
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
storeCompany.url = (options?: RouteQueryOptions) => {
    return storeCompany.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::storeCompany
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
storeCompany.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCompany.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PlatformController::storeCompany
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
    const storeCompanyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeCompany.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::storeCompany
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
        storeCompanyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeCompany.url(options),
            method: 'post',
        })
    
    storeCompany.form = storeCompanyForm
/**
* @see \App\Http\Controllers\PlatformController::setStatus
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
export const setStatus = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setStatus.url(args, options),
    method: 'patch',
})

setStatus.definition = {
    methods: ["patch"],
    url: '/api/platform/companies/{company}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PlatformController::setStatus
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
setStatus.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { company: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    company: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        company: typeof args.company === 'object'
                ? args.company.id
                : args.company,
                }

    return setStatus.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::setStatus
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
setStatus.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setStatus.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\PlatformController::setStatus
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
    const setStatusForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::setStatus
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
        setStatusForm.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    setStatus.form = setStatusForm
/**
* @see \App\Http\Controllers\PlatformController::setPlan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
export const setPlan = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setPlan.url(args, options),
    method: 'patch',
})

setPlan.definition = {
    methods: ["patch"],
    url: '/api/platform/companies/{company}/plan',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PlatformController::setPlan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
setPlan.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { company: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    company: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        company: typeof args.company === 'object'
                ? args.company.id
                : args.company,
                }

    return setPlan.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::setPlan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
setPlan.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setPlan.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\PlatformController::setPlan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
    const setPlanForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setPlan.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::setPlan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
        setPlanForm.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setPlan.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    setPlan.form = setPlanForm
/**
* @see \App\Http\Controllers\PlatformController::payments
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
export const payments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payments.url(options),
    method: 'get',
})

payments.definition = {
    methods: ["get","head"],
    url: '/api/platform/payments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlatformController::payments
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
payments.url = (options?: RouteQueryOptions) => {
    return payments.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::payments
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
payments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payments.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PlatformController::payments
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
payments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payments.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PlatformController::payments
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
    const paymentsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payments.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PlatformController::payments
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
        paymentsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payments.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PlatformController::payments
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
        paymentsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payments.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payments.form = paymentsForm
/**
* @see \App\Http\Controllers\PlatformController::decidePayment
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
export const decidePayment = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decidePayment.url(args, options),
    method: 'post',
})

decidePayment.definition = {
    methods: ["post"],
    url: '/api/platform/payments/{payment}/decision',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlatformController::decidePayment
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
decidePayment.url = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payment: typeof args.payment === 'object'
                ? args.payment.id
                : args.payment,
                }

    return decidePayment.definition.url
            .replace('{payment}', parsedArgs.payment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::decidePayment
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
decidePayment.post = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decidePayment.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PlatformController::decidePayment
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
    const decidePaymentForm = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decidePayment.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::decidePayment
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
        decidePaymentForm.post = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decidePayment.url(args, options),
            method: 'post',
        })
    
    decidePayment.form = decidePaymentForm
const PlatformController = { dashboard, companies, storeCompany, setStatus, setPlan, payments, decidePayment }

export default PlatformController