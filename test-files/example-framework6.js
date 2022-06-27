window.Framework = {
    config: {
        name: "AcmeCRM",
        clientIds: {
            "cac1.pure.cloud": "<your OAuth Client ID>",
            "mypurecloud.com": "<your OAuth Client ID>",
            "usw2.pure.cloud": "<your OAuth Client ID>",
            "aps1.pure.cloud": "<your OAuth Client ID>",
            "apne2.pure.cloud": "<your OAuth Client ID>",
            "mypurecloud.com.au": "<your OAuth Client ID>",
            "mypurecloud.jp": "<your OAuth Client ID>",
            "mypurecloud.ie": "<your OAuth Client ID>",
            "mypurecloud.de": "<your OAuth Client ID>",
            "euw2.pure.cloud": "<your OAuth Client ID>"
        },
        settings: {
            embedWebRTCByDefault: true,
            hideWebRTCPopUpOption: false,
            enableCallLogs: true,
            hideCallLogSubject: false,
            hideCallLogContact: false,
            hideCallLogRelation: false,
            enableTransferContext: true,
            dedicatedLoginWindow: false,
            embeddedInteractionWindow: true,
            enableConfigurableCallerId: false,
            enableServerSideLogging: false,
            enableCallHistory: false,
            defaultOutboundSMSCountryCode: "+1",
            searchTargets: ["people", "queues", "frameworkContacts", "externalContacts"],
            callControls: ["pickup", "transfer", "mute", "disconnect"],
            theme: {
                primary: "#62367A",
                text: "#DAD5DD",
                notification: {
                    success: {
                        primary: "#CCE5FF",
                        text: "#004085"
                    },
                    error: {
                        primary: "#f8D7DA",
                        text: "#721C24"
                    }
                }
            },
            sso: {
                provider: "",
                orgName: ""
            },
            display: {
                interactionDetails: {
                    call: [
                        "framework.DisplayAddress",
                        "call.Ani",
                        "call.ConversationId"
                    ]
                }
            }
        },
        helpLinks: {
            InteractionList: "https://help.mypurecloud.com/articles/about-interaction-list/",
            CallLog: "https://help.mypurecloud.com/articles/about-call-logs/",
            Settings: "https://help.mypurecloud.com/articles/about-settings/"
        },
        customInteractionAttributes: ["example_URLPop", "example_SearchValue"],
        getUserLanguage: function(callback) {
            callback("en-US");
        }
    },
    initialSetup: function () {
    },
    screenPop: function (searchString, interaction) {
        // Use your CRM vendor's API to perform screen pop.
    },
    processCallLog: function (callLog, interaction, eventName, onSuccess, onFailure)  {
       // Use your CRM vendor's API to provide interaction log information.
       onSuccess({
           id: externalCallLog.id
       });
    },
    openCallLog: function (callLog) {
    },
    contactSearch: function (searchValue, onSuccess, onFailure) {

    }
};

window.PureCloud = {
    addAssociation: function ({
        type: "contact"
        id: "1234",
        text: "John Smith"
    }),
    addTransferContext: function ({
        name: "Case: 1234 - Broken Phone",
        attributes: {example_TransferContext: "1234"}
    }),
    clickToDial: function ({
        number: "3172222222",
        type: "call",
        autoPlace: true,
        queueId: "04a183b6-de9e-4c01-9e88-eab81799ad0z",
        attributes: {example_URLPop: "https://www.genesys.com"}
    }),
    subscribe([{
            type: "Interaction",
            categories: ["connect", "disconnect"],
            callback: function (category, data) {}
        },
        {
            type: "Notification",
            callback: function (category, data) {}
        },
        {
            type: "UserAction",
            callback: function (category, data) {}
        }
    ]),
    Interaction: {
        addCustomAttributes: function ({
            interactionId: "1234-1234-1234-1234",
            attributes: {record_url: "/0000413456"}
        }),
        updateState: function ({
            action: "blindTransfer",
            id: "1234-1234-1234-1234",
            participantContext: {
                transferTarget: "3175550123",
                transferTargetType: "address"
            }
        }),
        Chat: {
            getTranscript: function ({
                interactionId: "1234-1234-1234-1234",
                callback: function (data) {}
            })
        }
    },
    User: {
        setView: function ({
            type: "main",
            view: {name: "interactionList"}
        }),
        updateStatus: function ({id: "1234-1234-1234-1234"}),
        Notification: {
            notifyUser: function ({
                message: "Failed to save an interaction log.",
                type: "error",
                theme: {
                    primary: "#f8D7DA",
                    text: "#721C24"
                }
            }),
            setAudioConfiguration: function ({
                call: true,
                chat: true,
                callback: false
            })
        }
    }
};