<?php

return [
    // The events a company can subscribe to, with the label the screen shows.
    'events' => [
        'payroll.finalized' => 'Payroll Finalized',
        'employee.created' => 'Employee Created',
        'leave.approved' => 'Leave Approved',
    ],

    // Seconds to wait for the receiving server, and the pauses (seconds) before each retry of a failed delivery.
    'timeout' => 10,
    'backoff' => [60, 300, 900, 3600],

    // A webhook URL must point to the public internet. Only a local test may turn this on, so a company can never aim the server at its own network.
    'allow_private' => (bool) env('WEBHOOKS_ALLOW_PRIVATE', false),
];
