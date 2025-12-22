import { AnswerActionType, ChatStatus } from "@libs/p-comps";
import { StreamAnswer } from "./MsgRes"
import Mock from 'mockjs'


export class MockData {
    constructor() {
        if (process.env.NODE_ENV !== 'development') {
            throw new Error('MockData is only available in development mode.');
        }
    }
    _StreamData_CMU = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: {
                "title": "Good morning, Evelyn!",
                "summary": "Here's what you missed...",
                "msg_count": 5,
                "themes": [
                    {
                        "title": "Missed Calls",
                        "summary": "2 missed calls from Julia and 1 missed call from Mom, plus 10 missed calls from an unsaved number.",
                        "icon": "Theme Icon Reference",
                        "topics": [
                            {
                                "title": "Julia",
                                "summary": "Missed call at 8:45 AM",
                                "app_info": [
                                    {
                                        "app_name": "Dialer",
                                        "package_name": "com.android.dialer",
                                        "icon": "App Icon reference"
                                    }
                                ],
                                "actions": [
                                    {
                                        "id": "0|com.whatsapp|1|N/l8T/2XrrHvPwfEySsUUDFmMGocuoBupYau7Zi2ko8=\n|10453",
                                        "title": "Call Back",
                                        "type": "simpleAction"
                                    },
                                    {
                                        "id": "0|com.whatsapp|1|N/l8T/2XrrHvPwfEySsUUDFmMGocuoBupYau7Zi2ko8=\n|10454",
                                        "title": "Reply",
                                        "type": "remoteInput"
                                    }
                                ]
                            },
                            {
                                "title": "Mom",
                                "summary": "Missed call at 9:15 AM"
                            }
                        ]
                    },
                    {
                        "title": "Meetings & Work",
                        "summary": "You have two meetings and new slides from Katie. Julia also tagged you in the Calculus 101 chat.",
                        "topics": [
                            {
                                "title": "Katie",
                                "summary": "Shared new PowerPoint slides with you and asked for review",
                                "app_info": [
                                    {
                                        "app_name": "Teams",
                                        "package_name": "microsoftteams",
                                        "icon": "App Icon reference"
                                    }
                                ]
                            },
                            {
                                "title": "Calculus 101 Chat",
                                "summary": "Julia tagged you and asked if you have any updates about the Calculus homework",
                                "app_info": [
                                    {
                                        "app_name": "Whatsapp",
                                        "package_name": "com.whatsapp",
                                        "icon": "App Icon reference"
                                    }
                                ]
                            },
                            {
                                "title": "Homework Review Sync",
                                "summary": "Meeting scheduled for 10:30 AM with options to accept, snooze, or decline",
                                "app_info": [
                                    {
                                        "app_name": "Teams",
                                        "package_name": "microsoft.team",
                                        "icon": "App Icon reference"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Family",
                        "summary": "Honey asked you to pick up Tom after school because his meeting went longer than expected.",
                        "topics": [
                            {
                                "title": "Honey",
                                "summary": "Meeting extended, please pick up Tom from school",
                                "app_info": [
                                    {
                                        "app_name": "Whatsapp",
                                        "package_name": "com.whatsapp",
                                        "icon": "App Icon reference"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Miscellaneous",
                        "summary": "You have 10 unopened messages from an unsaved number.",
                        "topics": []
                    }
                ]
            },
            answerData: {
                actionType: AnswerActionType.CMU
            },
        }),
    ]

    // Schedule a meeting with Tom
    _StreamData_contactSelect = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: {
                "responseType": "ContactSelectResponse",
                "content": {
                    "title": "I found several people named Tom. Which one?",
                    "contacts": [
                        {
                            "id": "1",
                            "name": "Tom Smith",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#7B68EE', '#fff', 'Tom Smith'),
                        },
                        {
                            "id": "2",
                            "name": "Tom Brown",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#4682B4', '#fff', 'Tom Brown'),
                        },
                        {
                            "id": "3",
                            "name": "Tom Wilson",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#32CD32', '#fff', 'Tom Wilson'),
                        },
                        {
                            "id": "4",
                            "name": "Tom Miller",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#FF6347', '#fff', 'Tom Miller'),
                        },
                        {
                            "id": "5",
                            "name": "Tom Johnson",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#FFA500', '#fff', 'Tom Johnson'),
                        },
                        {
                            "id": "6",
                            "name": "Tom Davis",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#9370DB', '#fff', 'Tom Davis'),
                        },
                        {
                            "id": "7",
                            "name": "Tom Clark",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#20B2AA', '#fff', 'Tom Clark'),
                        },
                        {
                            "id": "8",
                            "name": "Tom Rodriguez",
                            "position": "UXD, senior manager",
                            "avatar": Mock.Random.image('40x40', '#FFC0CB', '#fff', 'Tom Rodriguez'),
                        }
                    ],
                    "itemized_summary": [
                        {
                            "title": "Tom Smith",
                            "message": "UXD, senior manager in Design Department",
                            "contact_id": "1"
                        },
                        {
                            "title": "Tom Brown",
                            "message": "UXD, senior manager in Product Department",
                            "contact_id": "2"
                        },
                        {
                            "title": "Tom Wilson",
                            "message": "UXD, senior manager in Engineering Department",
                            "contact_id": "3"
                        },
                        {
                            "title": "Tom Miller",
                            "message": "UXD, senior manager in Marketing Department",
                            "contact_id": "4"
                        },
                        {
                            "title": "Tom Johnson",
                            "message": "UXD, senior manager in Sales Department",
                            "contact_id": "5"
                        },
                        {
                            "title": "Tom Davis",
                            "message": "UXD, senior manager in Finance Department",
                            "contact_id": "6"
                        },
                        {
                            "title": "Tom Clark",
                            "message": "UXD, senior manager in HR Department",
                            "contact_id": "7"
                        },
                        {
                            "title": "Tom Rodriguez",
                            "message": "UXD, senior manager in Operations Department",
                            "contact_id": "8"
                        }
                    ],
                    "internal_metadata": {
                        "contact_select_cache": {},
                        "metadata_history": [{
                            "author": "user",

                            "message": "Schedule a meeting with Tom"
                        },
                        {
                            "author": "chat",
                            "message": "I found several people named Tom. Which one?"
                        }
                        ],
                        "search_parameters": {
                            "query": "Tom",
                            "result_count": 8,
                            "timestamp": new Date().toISOString()
                        }
                    }
                }
            },

            answerData: {
                actionType: AnswerActionType.CONTACT_SELECT
            },
        }),
    ]

    _StreamData_summary = [
        new StreamAnswer(


            {
                status: ChatStatus.DONE,
                response: 'testtest1test2',
                content: 'testtest1test2',
                answerData: {
                    actionType: AnswerActionType.SUMMARY
                },
            })

    ]
    _StreamData_questions = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: 'testtest1test2',
            answerData: {
                actionType: AnswerActionType.TEXT
            },
        }),
    ]
    _StreamData_audio = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: 'testtest1test2',
            answerData: {
                actionType: AnswerActionType.TEXT
            },
        }),
    ]
    _StreamData_images = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: 'testtest1test2',
            answerData: {
                actionType: AnswerActionType.TEXT
            },
        }),
    ]
    _StreamData_fileSearch = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: [{ "id": null, "file_name": "quantum.db", "file_path": "C:UsersXEJquantum.db", "last_modify_time": "2025-09-30 17:28:18", "author": null, "scope": "local" }, { "id": null, "file_name": "Quantum.sln", "file_path": "D:Gitlabquantum_cppQuantumSlnQuantum.sln", "last_modify_time": "2025-10-29 17:00:40", "author": null, "scope": "local" }, { "id": null, "file_name": "quantum.db", "file_path": "D:Lenovo_FilesＱuantumPackageoldLenovo_Quantum_Core_V20250825_2-signQuantumCorequantum.db", "last_modify_time": "2025-09-03 15:56:45", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumPrompt.exe", "file_path": "D:Lenovo_FilesＱuantumPackage20250926Quantum-9.01.0124QuantumPrompt.exe", "last_modify_time": "2025-09-26 05:06:04", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.cpp", "file_path": "D:GitlabMCP_Features_Dev_FullsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.cpp", "last_modify_time": "2025-08-01 15:35:58", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.h", "file_path": "D:GitlabMCP_Features_Dev_FullsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.h", "last_modify_time": "2025-08-01 15:35:58", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.cpp", "file_path": "D:Gitlabainowapprow_mainsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.cpp", "last_modify_time": "2025-08-22 15:38:00", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.h", "file_path": "D:Gitlabainowapprow_mainsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.h", "last_modify_time": "2025-08-22 15:38:00", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.cpp", "file_path": "D:Gitlabquantum_cppThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.cpp", "last_modify_time": "2025-08-26 14:54:24", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.h", "file_path": "D:Gitlabquantum_cppThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.h", "last_modify_time": "2025-08-26 14:54:24", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.cpp", "file_path": "D:GitlabainowapprowsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.cpp", "last_modify_time": "2025-11-03 10:15:51", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.h", "file_path": "D:GitlabainowapprowsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.h", "last_modify_time": "2025-11-03 10:15:51", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.cpp", "file_path": "D:Gitlabainowapp_fullsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.cpp", "last_modify_time": "2025-08-27 14:24:38", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.h", "file_path": "D:Gitlabainowapp_fullsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.h", "last_modify_time": "2025-08-27 14:24:38", "author": null, "scope": "local" }, { "id": null, "file_name": "quantum-server.log", "file_path": "C:UsersXEJquantum-server.log", "last_modify_time": "2025-09-30 17:32:53", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumAI.7z", "file_path": "D:Quantum programQuantumAI.7z", "last_modify_time": "2025-07-29 08:58:04", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.cpp", "file_path": "D:GitlabMCP_Features_DevsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.cpp", "last_modify_time": "2025-08-01 15:35:58", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.h", "file_path": "D:GitlabMCP_Features_DevsrcThirdParty7zip-cpp7zCPP7zipCompressQuantumDecoder.h", "last_modify_time": "2025-08-01 15:35:58", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumPrompt.cfg", "file_path": "D:Lenovo_FilesＱuantumPackageoldLenovo_Quantum_Core_V20250825_2-signQuantumPromptappQuantumPrompt.cfg", "last_modify_time": "2025-09-03 15:59:40", "author": null, "scope": "local" }, { "id": null, "file_name": "QuantumDecoder.cpp" }],
            // [{"scope": "GKB", "createTime":"2025-07-14T17:44:00.869577200","docName":"Accessibility PRD","editTime":"2025-07-14T17:44:00.869577200","fileName":"Accessibility PRD.docx","filePath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","id":1,"isDeleted":0,"labelPriority":1,"linkFileName":"Accessibility PRD.docx","linkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","oldLinkFileName":"Accessibility PRD.docx","oldLinkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","ownerId":"default","priority":0,"score":1.4525083,"status":"COMPLETED","summarizedStatus":"ADD_TO_SUMMARY","targetFileName":"Accessibility PRD.docx","targetFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","targetPath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","tokenNum":0},
            //     {"scope": "local", "createTime":"2025-07-14T17:44:00.869577200","docName":"Accessibility PRD","editTime":"2025-07-14T17:44:00.869577200","fileName":"Accessibility PRD.docx","filePath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","id":2,"isDeleted":0,"labelPriority":1,"linkFileName":"Accessibility PRD.docx","linkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","oldLinkFileName":"Accessibility PRD.docx","oldLinkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","ownerId":"default","priority":0,"score":1.4525083,"status":"COMPLETED","summarizedStatus":"ADD_TO_SUMMARY","targetFileName":"Accessibility PRD.docx","targetFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","targetPath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","tokenNum":0},
            //     {"scope": "GKB", "createTime":"2025-07-14T17:44:00.869577200","docName":"Accessibility PRD","editTime":"2025-07-14T17:44:00.869577200","fileName":"Accessibility PRD.docx","filePath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","id":3,"isDeleted":0,"labelPriority":1,"linkFileName":"Accessibility PRD.docx","linkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","oldLinkFileName":"Accessibility PRD.docx","oldLinkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","ownerId":"default","priority":0,"score":1.4525083,"status":"COMPLETED","summarizedStatus":"ADD_TO_SUMMARY","targetFileName":"Accessibility PRD.docx","targetFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","targetPath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","tokenNum":0},
            //     {"scope": "local", "createTime":"2025-07-14T17:44:00.869577200","docName":"Accessibility PRD","editTime":"2025-07-14T17:44:00.869577200","fileName":"Accessibility PRD.docx","filePath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","id":4,"isDeleted":0,"labelPriority":1,"linkFileName":"Accessibility PRD.docx","linkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","oldLinkFileName":"Accessibility PRD.docx","oldLinkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","ownerId":"default","priority":0,"score":1.4525083,"status":"COMPLETED","summarizedStatus":"ADD_TO_SUMMARY","targetFileName":"Accessibility PRD.docx","targetFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","targetPath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","tokenNum":0},
            //     {"scope": "GKB", "createTime":"2025-07-14T17:44:00.869577200","docName":"Accessibility PRD","editTime":"2025-07-14T17:44:00.869577200","fileName":"Accessibility PRD.docx","filePath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","id":5,"isDeleted":0,"labelPriority":1,"linkFileName":"Accessibility PRD.docx","linkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","oldLinkFileName":"Accessibility PRD.docx","oldLinkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","ownerId":"default","priority":0,"score":1.4525083,"status":"COMPLETED","summarizedStatus":"ADD_TO_SUMMARY","targetFileName":"Accessibility PRD.docx","targetFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","targetPath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","tokenNum":0},
            //     {"scope": "local", "createTime":"2025-07-14T17:44:00.869577200","docName":"Accessibility PRD","editTime":"2025-07-14T17:44:00.869577200","fileName":"Accessibility PRD.docx","filePath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","id":6,"isDeleted":0,"labelPriority":1,"linkFileName":"Accessibility PRD.docx","linkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","oldLinkFileName":"Accessibility PRD.docx","oldLinkFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","ownerId":"default","priority":0,"score":1.4525083,"status":"COMPLETED","summarizedStatus":"ADD_TO_SUMMARY","targetFileName":"Accessibility PRD.docx","targetFolder":"C:\\\\Demo files\\\\Files on local PC\\\\PRD","targetPath":"C:\\\\Demo files\\\\Files on local PC\\\\PRD\\\\Accessibility PRD.docx","tokenNum":0}
            // ],
            answerData: {
                actionType: AnswerActionType.UPLOADFILE
            },
        }),
    ]
    _StreamData_eventTime = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: {
                title: 'Design Review',
                eventList: [
                    {
                        title: 'Mobile App Flow, ',
                        time: '45 mins'
                    },
                    {
                        title: 'Web UI Components, ',
                        time: '60 mins'
                    },
                    {
                        title: 'Brand Guidelines Update, ',
                        time: '30 mins'
                    },
                ]
            },
            answerData: {
                actionType: AnswerActionType.EVENTTIME
            },
        }),
    ]

    _StreamData_groupMeeting = [
        new StreamAnswer({
            status: ChatStatus.DONE,
            response: 'testtest1test2',
            content: {
                title: 'Please select which event you would like to schedule a meeting for:',
                eventList: [
                    {
                        title: 'Talent Development, ',
                        time: '45 mins'
                    },
                    {
                        title: 'Orientation Training, ',
                        time: '60 mins'
                    },
                    {
                        title: 'Design Internal Audit, ',
                        time: '30 mins'
                    },
                    {
                        title: 'technical seminar, ',
                        time: '50 mins'
                    },
                ]
            },
            answerData: {
                actionType: AnswerActionType.EVENTTIME
            },
        }),
    ]
    _StreamData_expedia = [
      new StreamAnswer(
            {
                status: ChatStatus.DONE,
                response: '',
                content: 'My pleasure',
                answerData: {
                    actionType: AnswerActionType.THIRD_PARTY_AGENT,
                    followUp: 'Next Step?',
                    relatedQuestions: [{
                      text: 'where'
                    }, {
                      text: 'when'
                    }, {
                      text: 'how'
                    }],
                    payload: {
                      MCPUI: {
                        type: "resource",
                        resource: {
                          uri: "ui://three.part.agent/expedia",
                          mimeType: "text/uri-list",
                          text: "",
                          blob: null
                        },
                        data: {
                          "cards": {
                            "name": "Expedia",
                            "icon": "url",
                          }
                        }
                      }
                    }
                },
            })
    ]
    _generateImgDataText(size: string = '200*200') {
        return Mock.Random.dataImage(size)
    }
    _generateStreamDataText() {
        const min = Math.round(Math.random() * 10)
        const max = min + Math.round(Math.random() * 10)
        const len = Math.round(Math.random() * 10)
        const res = [] as StreamAnswer[]
        let str = ''
        for (let i = 0; i < len; i++) {
            const sentence = this.getMockSentence(min, max)
            str += sentence
            res.push(
                new StreamAnswer({
                    status: i === len - 1 ? ChatStatus.DONE : ChatStatus.ONGOING,
                    response: str,
                    content: str,
                    answerData: {
                        actionType: AnswerActionType.TEXT
                    },
                }),
            )
        }
        return res
    }
    getMockSentence(min: number = 1, max: number = 5) {
        return Mock.mock(`@sentence(${min}, ${max})`) as string
    }
    getStreamMockData = (query: string, cb: (done: boolean, data: StreamAnswer) => void) => {
        console.log('getMockData', query);
        let i = 0
        let resList = this._generateStreamDataText()


        if (query.toLowerCase() === 'catch me up') {
            resList = this._StreamData_CMU
        }
        if (query.toLowerCase() === 'find the accessibility prd') {
            resList = this._StreamData_fileSearch
        }
        if (query.toLowerCase() === 'what time is the design review?') {
            resList = this._StreamData_eventTime
        }
        if (query.toLowerCase() === 'schedule a meeting with tom') {
            resList = this._StreamData_contactSelect
        }
        if (query.toLowerCase() === 'schedule a group number meeting for the team') {
            resList = this._StreamData_groupMeeting
        }
        // 处理选择特定Tom后的回复
        if (query.toLowerCase().includes('i want to schedule with tom')) {
            resList = [
                new StreamAnswer({
                    status: ChatStatus.DONE,
                    response: 'Meeting scheduled',
                    content: {
                        "responseType": "TextResponse",
                        "content": {
                            "text": "Great! I've scheduled a meeting with Tom. Would you like to set a specific time and date?"
                        }
                    },
                    answerData: {
                        actionType: AnswerActionType.TEXT
                    },
                })
            ]
        }
        // 处理选择特定事件后的回复
        if (query.toLowerCase().includes('i want to schedule the')) {
            resList = [
                new StreamAnswer({
                    status: ChatStatus.DONE,
                    response: 'Meeting details',
                    content: `Here are your meeting details:<br><br><div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;"><div>Date: June 11th, 2024</div><div>Time: 3:55 PM</div><div>Location: South Hall, Room 115</div></div><button style="background-color: transparent; border: 1px solid #161C27; border-radius: 50px; padding: 8px 20px; cursor: pointer; font-size: 14px; color: #161C27; display: flex; align-items: center; justify-content: center; gap: 8px; width: fit-content;">View outlook calendar <img src="apps/Pod1/src/assets/icons/view.svg" alt="View" style="width: 8px; height: 8px; vertical-align: middle;"/></button>`,
                    answerData: {
                        actionType: AnswerActionType.TEXT
                    },
                })
            ]
        }
        // expedia
        if (query.toLowerCase().includes('book hotel')) {
          resList = this._StreamData_expedia
        }
        console.log('resList--------', resList);



        const interval = setInterval(async () => {
            const res = resList[i++]
            console.log('chatService', res);
            if (res.status === ChatStatus.DONE) {
                clearInterval(interval);
            }
            cb(res.status === ChatStatus.DONE, res)



        }, 500)

        return
    }
    // 'https://app/appInformation/changeSize' = (query: unknown) => {
    //     const res = {
    //         "status": "success",
    //         "data": {
    //             "size": "small"
    //         }
    //     }
    //     return res

    // }

    // 生成题目的mock方法
    'https://app/quiz/generateQuestions' = () => {
        const mockResponse = {
            "request_id": "mock_request_001",
            "success": true,
            "title": "China's Submarine Fleet and ASW Capabilities Quiz",
            "content": [
                {
                    "id": "Q1",
                    "type": "choice",
                    "question": "What is the primary strategic implication of China's advancements in its submarine fleet and anti-submarine warfare (ASW) capabilities, particularly within the First Island Chain?",
                    "options": [
                        {
                            "code": "A",
                            "text": "It primarily aims to secure China's trade routes in the Indian Ocean."
                        },
                        {
                            "code": "B",
                            "text": "It could significantly challenge US maritime dominance and operations in the Western Pacific."
                        },
                        {
                            "code": "C",
                            "text": "It is designed to facilitate joint naval exercises with allied nations in the region."
                        },
                        {
                            "code": "D",
                            "text": "It focuses on developing deep-sea exploration technologies rather than military applications."
                        }
                    ],
                    "answer": {
                        "code": "B",
                        "judge": null,
                        "short_answer": null
                    },
                    "analysis": "The document explicitly states that China's improvements, along with its ASW weapons and the 'Undersea Great Wall,' 'could spell trouble in the First Island Chain for US submarines should Beijing and Washington go to war, especially over Taiwan.' It also mentions that these developments 'will likely start to challenge US military maritime dominance under the waves.' Option B directly reflects this core strategic implication. Options A, C, and D are not supported by the text; the focus is clearly on military challenge to the US in the Western Pacific."
                },
                {
                    "id": "Q2",
                    "type": "bool",
                    "question": "China's older nuclear-powered submarines have historically been considered quieter than their US counterparts, making them harder to detect.",
                    "answer": {
                        "code": null,
                        "judge": false,
                        "short_answer": null
                    },
                    "analysis": "The text states, 'China's submarine fleet is heavily composed of conventional, diesel-electric submarines... It's been building nuclear-powered ones for decades, but these have long been considered louder than US subs.' A noisy sub is more easily detected, directly contradicting the statement that they were considered quieter. Therefore, the statement is false."
                },
                {
                    "id": "Q3",
                    "type": "saq",
                    "question": "What is the primary purpose of China's 'Underwater Great Wall' project in the South China Sea?",
                    "answer": {
                        "code": null,
                        "judge": null,
                        "short_answer": "The 'Underwater Great Wall' project is designed to trace surface and underwater vessels. It consists of equipment like underwater hydrophones to monitor vast areas in the seas, particularly in the First Island Chain."
                    },
                    "analysis": "The text explicitly describes the 'Underwater Great Wall' project as 'designed to trace surface and underwater vessels.' It further elaborates that the equipment includes 'a network of underwater hydrophones that boast China's ability to monitor vast areas in the seas, particularly in the First Island Chain.' Key scoring points include mentioning tracing/monitoring vessels and its role in surveillance within the First Island Chain."
                },
                {
                    "id": "Q4",
                    "type": "choice",
                    "question": "According to the text, what is a significant advantage China possesses in submarine development compared to the US?",
                    "options": [
                        {
                            "code": "A",
                            "text": "Superiority in nuclear propulsion technology for all submarine types."
                        },
                        {
                            "code": "B",
                            "text": "A more extensive global network of submarine bases."
                        },
                        {
                            "code": "C",
                            "text": "Greater shipbuilding and manufacturing capacity, allowing faster production."
                        },
                        {
                            "code": "D",
                            "text": "Exclusive access to advanced stealth materials unavailable to other nations."
                        }
                    ],
                    "answer": {
                        "code": "C",
                        "judge": null,
                        "short_answer": null
                    },
                    "analysis": "The document states, 'China boasts the shipbuilding and manufacturing capacity to build submarines quicker than the US. Washington currently faces major delays and cost overruns on a bulk of its shipbuilding programs, including new submarines.' This directly supports option C. Option A is incorrect as the text mentions China is 'on the cusp of producing world-class nuclear-powered submarines' and getting 'closer to on-par with some of Russia's more advanced submarines,' not necessarily superior in all types. Options B and D are not mentioned in the text."
                },
                {
                    "id": "Q5",
                    "type": "choice",
                    "question": "By 2030, what is the projected total growth in the number of vessels in China's submarine fleet compared to 2020?",
                    "options": [
                        {
                            "code": "A",
                            "text": "5 vessels"
                        },
                        {
                            "code": "B",
                            "text": "10 vessels"
                        },
                        {
                            "code": "C",
                            "text": "15 vessels"
                        },
                        {
                            "code": "D",
                            "text": "20 vessels"
                        }
                    ],
                    "answer": {
                        "code": "B",
                        "judge": null,
                        "short_answer": null
                    },
                    "analysis": "The text explicitly states: 'Projections estimate it'll have 55 non-nuclear attack submarines, 13 nuclear-powered attack submarines, and eight nuclear-powered ballistic submarines by 2030, representing growth of 10 vessels in total from 2020.' Therefore, option B is the correct answer. The other options are incorrect numerical distractors."
                },
                {
                    "id": "Q6",
                    "type": "bool",
                    "question": "The US military expects China to attempt to deny it access and control in the Western Pacific by primarily targeting US ground forces.",
                    "answer": {
                        "code": null,
                        "judge": false,
                        "short_answer": null
                    },
                    "analysis": "The document states, 'The US military expects China to attempt to deny it access and control in the region by threatening American airpower, as well as naval power.' There is no mention of primarily targeting US ground forces. Therefore, the statement is false."
                },
                {
                    "id": "Q7",
                    "type": "saq",
                    "question": "What are the likely roles of US submarines in a potential conflict with China, as described in the document?",
                    "answer": {
                        "code": null,
                        "judge": null,
                        "short_answer": "In a potential conflict, US submarines are likely tasked with torpedoing Chinese ships and striking military bases with missiles."
                    },
                    "analysis": "The text directly addresses this: 'For US submarines, China's layered network of sensors and anti-submarine warfare systems and its fleet of increasingly capable submarines are key obstacles to their likely roles in a China war: Torpedoing Chinese ships and striking military bases with missiles.' The model answer captures both key roles mentioned."
                },
                {
                    "id": "Q8",
                    "type": "choice",
                    "question": "Which of the following is NOT explicitly mentioned as a component of China's anti-submarine warfare (ASW) capabilities or advancements?",
                    "options": [
                        {
                            "code": "A",
                            "text": "A network of underwater hydrophones."
                        },
                        {
                            "code": "B",
                            "text": "Uncrewed systems for detection."
                        },
                        {
                            "code": "C",
                            "text": "Advanced satellite-based laser detection systems."
                        },
                        {
                            "code": "D",
                            "text": "Claimed advances in artificial intelligence for detection and tracking."
                        }
                    ],
                    "answer": {
                        "code": "C",
                        "judge": null,
                        "short_answer": null
                    },
                    "analysis": "The document mentions 'a network of underwater hydrophones' and 'uncrewed systems' as part of the 'Underwater Great Wall' project. It also cites 'recent Chinese articles that claim advances in artificial intelligence' for detection. However, 'advanced satellite-based laser detection systems' are not mentioned anywhere in the text as a component of China's ASW capabilities. Therefore, option C is the correct answer as it is the one NOT explicitly mentioned."
                },
                {
                    "id": "Q9",
                    "type": "choice",
                    "question": "How might China's advanced sensor networks potentially impact US submarine operations in a wartime scenario?",
                    "options": [
                        {
                            "code": "A",
                            "text": "They would enable US submarines to operate more freely due to improved intelligence sharing."
                        },
                        {
                            "code": "B",
                            "text": "They could force US submarines to stay at a further distance, limiting Washington's options."
                        },
                        {
                            "code": "C",
                            "text": "They would primarily target US surface vessels, leaving submarines unaffected."
                        },
                        {
                            "code": "D",
                            "text": "They would allow US submarines to easily bypass Chinese defenses through advanced jamming."
                        }
                    ],
                    "answer": {
                        "code": "B",
                        "judge": null,
                        "short_answer": null
                    },
                    "analysis": "The text states, 'In a wartime scenario, the network of sensors could force US submarines to stay at a further distance, limiting Washington's options.' This directly supports option B. Options A, C, and D are contrary to the information provided in the document, which highlights the challenges these sensors pose to US submarines."
                },
                {
                    "id": "Q10",
                    "type": "choice",
                    "question": "What is the US Naval War College Report's assessment from August 2023 regarding China's nuclear-powered submarines?",
                    "options": [
                        {
                            "code": "A",
                            "text": "China's nuclear-powered submarines are still decades behind US capabilities."
                        },
                        {
                            "code": "B",
                            "text": "China is on the cusp of producing 'world-class nuclear-powered submarines.'"
                        },
                        {
                            "code": "C",
                            "text": "China has abandoned nuclear submarine development in favor of conventional ones."
                        },
                        {
                            "code": "D",
                            "text": "China's nuclear submarines are primarily designed for Arctic exploration."
                        }
                    ],
                    "answer": {
                        "code": "B",
                        "judge": null,
                        "short_answer": null
                    },
                    "analysis": "The document states, 'Papers like the US Naval War College Report on China's submarines from August 2023 have previously assessed that China is on the cusp of producing 'world-class nuclear-powered submarines.'' This directly matches option B. Options A, C, and D are not supported by the text and contradict the report's assessment."
                }
            ],
        };

        return mockResponse;
    }


    getMockData = (path: keyof MockData, query: unknown) => {
        console.log('getMockData', query);
        if (this[path] as () => any) {
            return (this[path] as (query: unknown) => any)(query)
        }
        console.error(path + ' is not defined');

        return

    }
}
