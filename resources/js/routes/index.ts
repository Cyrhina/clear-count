import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: login.url(options),
        method: 'get',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
        loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url(options),
            method: 'get',
        })
            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
 * @route '/login'
 */
        loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    login.form = loginForm
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
 * @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
 * @route '/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: home.url(options),
    method: 'post',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: home.url(options),
    method: 'put',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: home.url(options),
    method: 'patch',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: home.url(options),
    method: 'delete',
})
/**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
home.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: home.url(options),
    method: 'options',
})

    /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
    const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: home.url(options),
        method: 'get',
    })

            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
        homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url(options),
            method: 'get',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
        homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
        homeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: home.url(options),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
        homeForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
        homeForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
        homeForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \Illuminate\Routing\RedirectController::__invoke
 * @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
 * @route '/'
 */
        homeForm.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: home.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'OPTIONS',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    home.form = homeForm
/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::dashboard
 * @see app/Http/Controllers/OpsController.php:16
 * @route '/dashboard'
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
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
export const myProfile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myProfile.url(options),
    method: 'get',
})

myProfile.definition = {
    methods: ["get","head"],
    url: '/my-profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
myProfile.url = (options?: RouteQueryOptions) => {
    return myProfile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
myProfile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myProfile.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
myProfile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: myProfile.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
    const myProfileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: myProfile.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
        myProfileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myProfile.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::myProfile
 * @see app/Http/Controllers/OpsController.php:21
 * @route '/my-profile'
 */
        myProfileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myProfile.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    myProfile.form = myProfileForm
/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
export const attendance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})

attendance.definition = {
    methods: ["get","head"],
    url: '/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
attendance.url = (options?: RouteQueryOptions) => {
    return attendance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
attendance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
attendance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attendance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
    const attendanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: attendance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
        attendanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attendance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::attendance
 * @see app/Http/Controllers/OpsController.php:36
 * @route '/attendance'
 */
        attendanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attendance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    attendance.form = attendanceForm
/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
export const schedules = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schedules.url(options),
    method: 'get',
})

schedules.definition = {
    methods: ["get","head"],
    url: '/schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
schedules.url = (options?: RouteQueryOptions) => {
    return schedules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
schedules.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: schedules.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
schedules.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: schedules.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
    const schedulesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: schedules.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
        schedulesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schedules.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::schedules
 * @see app/Http/Controllers/OpsController.php:41
 * @route '/schedules'
 */
        schedulesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: schedules.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    schedules.form = schedulesForm
/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
export const overtime = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtime.url(options),
    method: 'get',
})

overtime.definition = {
    methods: ["get","head"],
    url: '/overtime',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
overtime.url = (options?: RouteQueryOptions) => {
    return overtime.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
overtime.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtime.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
overtime.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overtime.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
    const overtimeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: overtime.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
        overtimeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overtime.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::overtime
 * @see app/Http/Controllers/OpsController.php:46
 * @route '/overtime'
 */
        overtimeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overtime.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    overtime.form = overtimeForm
/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
export const approvals = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
approvals.url = (options?: RouteQueryOptions) => {
    return approvals.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
approvals.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
approvals.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
    const approvalsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: approvals.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
        approvalsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::approvals
 * @see app/Http/Controllers/OpsController.php:51
 * @route '/approvals'
 */
        approvalsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: approvals.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    approvals.form = approvalsForm
/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
export const leave = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leave.url(options),
    method: 'get',
})

leave.definition = {
    methods: ["get","head"],
    url: '/leave',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
leave.url = (options?: RouteQueryOptions) => {
    return leave.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
leave.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leave.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
leave.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: leave.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
    const leaveForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: leave.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
        leaveForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: leave.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::leave
 * @see app/Http/Controllers/OpsController.php:56
 * @route '/leave'
 */
        leaveForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: leave.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    leave.form = leaveForm
/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
export const statutory = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statutory.url(options),
    method: 'get',
})

statutory.definition = {
    methods: ["get","head"],
    url: '/statutory',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
statutory.url = (options?: RouteQueryOptions) => {
    return statutory.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
statutory.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statutory.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
statutory.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statutory.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
    const statutoryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: statutory.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
        statutoryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: statutory.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::statutory
 * @see app/Http/Controllers/OpsController.php:106
 * @route '/statutory'
 */
        statutoryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: statutory.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    statutory.form = statutoryForm
/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
export const loans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loans.url(options),
    method: 'get',
})

loans.definition = {
    methods: ["get","head"],
    url: '/loans-deductions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
loans.url = (options?: RouteQueryOptions) => {
    return loans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
loans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
loans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: loans.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
    const loansForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: loans.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
        loansForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: loans.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::loans
 * @see app/Http/Controllers/OpsController.php:111
 * @route '/loans-deductions'
 */
        loansForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: loans.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    loans.form = loansForm
/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
export const notifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})

notifications.definition = {
    methods: ["get","head"],
    url: '/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
notifications.url = (options?: RouteQueryOptions) => {
    return notifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
notifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
notifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notifications.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
    const notificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notifications.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
        notificationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::notifications
 * @see app/Http/Controllers/OpsController.php:166
 * @route '/notifications'
 */
        notificationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notifications.form = notificationsForm
/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
export const insights = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: insights.url(options),
    method: 'get',
})

insights.definition = {
    methods: ["get","head"],
    url: '/insights',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
insights.url = (options?: RouteQueryOptions) => {
    return insights.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
insights.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: insights.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
insights.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: insights.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
    const insightsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: insights.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
        insightsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: insights.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::insights
 * @see app/Http/Controllers/OpsController.php:181
 * @route '/insights'
 */
        insightsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: insights.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    insights.form = insightsForm
/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
export const userAccess = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userAccess.url(options),
    method: 'get',
})

userAccess.definition = {
    methods: ["get","head"],
    url: '/user-access',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
userAccess.url = (options?: RouteQueryOptions) => {
    return userAccess.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
userAccess.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userAccess.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
userAccess.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userAccess.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
    const userAccessForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: userAccess.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
        userAccessForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userAccess.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::userAccess
 * @see app/Http/Controllers/OpsController.php:186
 * @route '/user-access'
 */
        userAccessForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userAccess.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    userAccess.form = userAccessForm
/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
export const companySettings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companySettings.url(options),
    method: 'get',
})

companySettings.definition = {
    methods: ["get","head"],
    url: '/company-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
companySettings.url = (options?: RouteQueryOptions) => {
    return companySettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
companySettings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companySettings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
companySettings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: companySettings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
    const companySettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: companySettings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
        companySettingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companySettings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::companySettings
 * @see app/Http/Controllers/OpsController.php:191
 * @route '/company-settings'
 */
        companySettingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companySettings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    companySettings.form = companySettingsForm
/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
export const onboarding = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: onboarding.url(options),
    method: 'get',
})

onboarding.definition = {
    methods: ["get","head"],
    url: '/onboarding',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
onboarding.url = (options?: RouteQueryOptions) => {
    return onboarding.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
onboarding.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: onboarding.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
onboarding.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: onboarding.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
    const onboardingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: onboarding.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
        onboardingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: onboarding.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::onboarding
 * @see app/Http/Controllers/OpsController.php:196
 * @route '/onboarding'
 */
        onboardingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: onboarding.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    onboarding.form = onboardingForm
/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
export const branches = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})

branches.definition = {
    methods: ["get","head"],
    url: '/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
branches.url = (options?: RouteQueryOptions) => {
    return branches.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
branches.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
branches.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: branches.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
    const branchesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: branches.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
        branchesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branches.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::branches
 * @see app/Http/Controllers/OpsController.php:201
 * @route '/branches'
 */
        branchesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branches.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    branches.form = branchesForm
/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
export const subscription = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})

subscription.definition = {
    methods: ["get","head"],
    url: '/subscription',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
subscription.url = (options?: RouteQueryOptions) => {
    return subscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
subscription.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
subscription.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscription.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
    const subscriptionForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: subscription.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
        subscriptionForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: subscription.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::subscription
 * @see app/Http/Controllers/OpsController.php:206
 * @route '/subscription'
 */
        subscriptionForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: subscription.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    subscription.form = subscriptionForm
/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
export const integrations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: integrations.url(options),
    method: 'get',
})

integrations.definition = {
    methods: ["get","head"],
    url: '/integrations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
integrations.url = (options?: RouteQueryOptions) => {
    return integrations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
integrations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: integrations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
integrations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: integrations.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
    const integrationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: integrations.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
        integrationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: integrations.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::integrations
 * @see app/Http/Controllers/OpsController.php:211
 * @route '/integrations'
 */
        integrationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: integrations.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    integrations.form = integrationsForm
/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
export const forbidden = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forbidden.url(options),
    method: 'get',
})

forbidden.definition = {
    methods: ["get","head"],
    url: '/forbidden',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
forbidden.url = (options?: RouteQueryOptions) => {
    return forbidden.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
forbidden.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forbidden.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
forbidden.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forbidden.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
    const forbiddenForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forbidden.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
        forbiddenForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forbidden.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::forbidden
 * @see app/Http/Controllers/OpsController.php:221
 * @route '/forbidden'
 */
        forbiddenForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forbidden.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    forbidden.form = forbiddenForm