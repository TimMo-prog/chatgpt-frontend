function startLogUIClient() {
    if (window.LogUI) {
        let configurationObject = {
            logUIConfiguration: {
                endpoint: 'ws://127.0.0.1:8000/ws/endpoint/', 
                authorisationToken: 'eyJ0eXBlIjoibG9nVUktYXV0aG9yaXNhdGlvbi1vYmplY3QiLCJhcHBsaWNhdGlvbklEIjoiODY0NmZjNmQtMWRkNC00MzJjLTg5N2ItNzcyYmFhNTA1N2NiIiwiZmxpZ2h0SUQiOiJjMzlhMjJiMC0zMmM2LTQ5NGYtOTUxYy0yZmY4OTlmNTQzN2MifQ:1qTrHf:aO9E-EykumjVNZqBaqhUTbDeq8-nIeTMkRYUEUCMg6M', 
                verbose: true,
                browserEvents: {
                    blockEventBubbling: true,
                    eventsWhileScrolling: true,
                    URLChanges: true,
                    contextMenu: true,
                    pageFocus: true,
                    trackCursor: true,
                    cursorUpdateFrequency: 4000,
                    cursorLeavingPage: true,
                },
            },
            applicationSpecificData: {
                userID: 'user123', 
            },
            trackingConfiguration: {
                'input-change': {
                    selector: '.chat-input input',
                    event: 'keyup',
                    name: 'INPUT_CHANGE',
                    metadata: [
                        {
                            nameForLog: 'inputValue',
                            sourcer: 'elementProperty',
                            lookFor: 'value',
                        }
                    ]
                },
                'message-send': {
                    selector: '.chat-input button',
                    event: 'click',
                    name: 'MESSAGE_SEND'
                },
                'feedback-provided': {
                    selector: '.popup button',
                    event: 'click',
                    name: 'FEEDBACK_PROVIDED'
                },
                'task-started': {
                    selector: '.popup button',
                    event: 'click',
                    name: 'TASK_STARTED'
                },
                'task-description-viewed': {
                    selector: '.task-description-button',
                    event: 'click',
                    name: 'TASK_DESCRIPTION_VIEWED'
                },
                'task-completed': {
                    selector: '.finish-button',
                    event: 'click',
                    name: 'TASK_COMPLETED'
                }
            },
        };

        LogUI.init(configurationObject);
    } else {
        console.error("LogUI is not available!");
    }
}


startLogUIClient();
