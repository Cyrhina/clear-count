import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PayslipEmailController::index
 * @see app/Http/Controllers/PayslipEmailController.php:26
 * @route '/api/payslip-emails'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payslip-emails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayslipEmailController::index
 * @see app/Http/Controllers/PayslipEmailController.php:26
 * @route '/api/payslip-emails'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayslipEmailController::index
 * @see app/Http/Controllers/PayslipEmailController.php:26
 * @route '/api/payslip-emails'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayslipEmailController::index
 * @see app/Http/Controllers/PayslipEmailController.php:26
 * @route '/api/payslip-emails'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayslipEmailController::index
 * @see app/Http/Controllers/PayslipEmailController.php:26
 * @route '/api/payslip-emails'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayslipEmailController::index
 * @see app/Http/Controllers/PayslipEmailController.php:26
 * @route '/api/payslip-emails'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayslipEmailController::index
 * @see app/Http/Controllers/PayslipEmailController.php:26
 * @route '/api/payslip-emails'
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
* @see \App\Http\Controllers\PayslipEmailController::send
 * @see app/Http/Controllers/PayslipEmailController.php:33
 * @route '/api/payslip-emails'
 */
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/api/payslip-emails',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayslipEmailController::send
 * @see app/Http/Controllers/PayslipEmailController.php:33
 * @route '/api/payslip-emails'
 */
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayslipEmailController::send
 * @see app/Http/Controllers/PayslipEmailController.php:33
 * @route '/api/payslip-emails'
 */
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayslipEmailController::send
 * @see app/Http/Controllers/PayslipEmailController.php:33
 * @route '/api/payslip-emails'
 */
    const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayslipEmailController::send
 * @see app/Http/Controllers/PayslipEmailController.php:33
 * @route '/api/payslip-emails'
 */
        sendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send.url(options),
            method: 'post',
        })
    
    send.form = sendForm
const payslipEmails = {
    index: Object.assign(index, index),
send: Object.assign(send, send),
}

export default payslipEmails