/**
 * Created by Jora on 2016/7/29.
 */
define([
    'atomicNotify'
    ], function(){
    'use strict';

    var ctrl = ['$scope', '$http', '$localStorage', '$timeout', '$state', 'extensionsService', '$rootScope', 'atomicNotifyService', function($scope, $http, $localStorage, $timeout, $state, extensionsService, $rootScope, atomicNotifyService){
        $scope.sessionName = $localStorage.userName;

        $scope.myParam = {
            orgId: $localStorage.orgId,
            userId: $localStorage.userId,
            sessionId: $localStorage.sessionId,
        };

        $scope.extensionsPage = function(){
            extensionsService.serviceManages($scope.myParam,function(data){
                if(data.code == 0){
                    $scope.newExtensions = JSON.parse(data.data);

                    $scope.totalNum = $scope.newExtensions[0].serviceList.items.length;
                    $scope.pagList = $scope.newExtensions[0].serviceList.items.slice(0,5);

                    $scope.pageClick = function(page, pageSize, total){
                    
                        $scope.pagList = $scop.newExtensions[0].serviceList.items.slice(pageSize*(page-1), pageSize*page);
                    
                    };

                    /*  点击服务的删除 */
                    $scope.alertBox1 = false;   //  alert的文本框
                    $scope.delItem = function(dcIds,item){
                        $scope.alertBox1 = !false;
                        /*  确定删除按钮  内为删除函数  */
                        $scope.extnesionsDel = function(){
                            $scope.alertBox1 = false;
                            var serverNP = item.spec.ports[0].nodePort;
                            var lebelType = item.metadata.labels.type;
                            var nodePorts = Number(serverNP);
                            $scope.LebeltypeParameter = {
                                userId : "",
                                dcId : "",
                                nodePort : "",
                                orgId : "",
                                sessionId : "",
                                serversName : ""
                            };
                            $scope.LebeltypeParameter.serversName = String(item.metadata.name);
                            $scope.LebeltypeParameter.sessionId = $localStorage.sessionId;
                            $scope.Lebeltypearameter.orgId = $localStorage.orgId;
                            $scope.LebeltypeParameter.userId = Number($localStorage.userId);
                            $scope.LebeltypeParameter.dcId = Number(dcIds);
                            $scope.LebeltypeParameter.nodePort = nodePorts;

                            if(lebelType == "service"){
                                extensionsService.lebelTypes($scope.LebeltypeParameter,function(rep){
                                    
                                    if(rep.code == 0){
                                        atomicNotifyService.success(rep.message, 2000);
                                        $timeout(function() {
                                            $scope.extensionsPage();
                                        }, 1000);
                                    }
                                    else{
                                        atomicNotifyService.error(rep.message, 2000);
                                    }
                                },function(rep){
                                    atomicNotifyService.error(rep.message, 2000);
                                });
                            }
                        };
                        /*  取消删除按钮  */
                        $scope.extnesionsBack = function(){
                            $scope.alertBox1 = false;
                        };
                    };

                    
                }
            },function(){
                if(data.code != 0){
                    alert(data.message);
                }
            });
        };
        $scope.extensionsPage();

        var demoss = "";

        // 创建服务
        extensionsService.CreatService($scope.myParam,function(data){
            $scope.extentServerLei = JSON.parse(data.data);
            demoss = $scope.extentServerLei.orgName;
            if(data.code == 0){
                $scope.serverDisabled = true;
                $scope.serverClick1 = function(){
                    if($scope.serverRadios == 1){
                        $scope.serverDisabled = false;
                    }else if($scope.serverRadios == 0){
                        $scope.serverDisabled = true;
                    }
                };
            }
        },function(data){
            alert(data.message);
        });

        //   label add....
        $scope.leis = [];
        //   port add....
        $scope.ports = [];


        $scope.addLabels = function(){
            $scope.leis.push({});
        };
        //   del
        $scope.delLabels = function($index){
            $scope.leis.splice($index,1);
        };
        var i = 0;
        $scope.addPort = function(){
            i++;
            $scope.ports.push({"name" : "port"+ i});
        };
        //   del
        $scope.delPort = function($index){
            $scope.ports.splice($index,1);
        };


        // 拼接json
        $scope.param = {
            "serviceName": "",
            "orgName": "",
            "dcIdList": [],
            "service": {
                "kind": "Service",
                "apiVersion": "v1",
                "metadata": {
                    "name": "",
                    "labels": {
                        "name": "",
                        "namespace":"",
                        "author" : "",
                        "type" : "service"
                    }
                },
                "spec": {
                    "type": "",
                    "selector": {},
                    "ports": [
                        {
                            "name": "",
                            "protocol": "",
                            "port": "",
                            "targetPort": "",
                            "nodePort": ""
                        }
                    ]
                }
            }
        }

        $scope.formData = {};
        var demo = [];
        $scope.mocks = {};
        $scope.dataTrans = {
            dataCenters : []
        };

        // 选择器
        $scope.Checkeds = [];
        $scope.addCheckeds = function(){
            $scope.Checkeds.push({});
        };
        $scope.delCheckeds = function($index){
            $scope.Checkeds.splice($index,1);
        };

        // 协议
        $scope.portlists = [
            {protocol : "TCP"}
        ];
        $scope.activities =[
            "TCP",
            "UDP"
        ];

        $scope.serviceNameExit = function(){

            if( $scope.param.serviceName != undefined && $scope.param.serviceName != ''){
                var param = {
                    orgId: $localStorage.orgId,
                    userId: $localStorage.userId,
                    sessionId: $localStorage.sessionId,
                    "name": $scope.param.serviceName
                };
                extensionsService.serviceExit(param, function(res){
                    if(res.code == 1415){
                        $scope.nameExit = true;
                        $scope.serversubmit = function(){
                            return;
                        }
                    }else{
                        $scope.nameExit = false;

                    }

                });
            }
        };

        $scope.serversubmit = function(){
            // 协议
            $scope.param.service.spec.ports[0].protocol = $scope.portlists[0].protocol;
            // 服务类型  ok
            var type = "NodePort";
            if($scope.serverRadios == 0){
                var type="ClusterIP";
            }
            else if($scope.serverRadios == 1){
                var type="NodePort";
            }
            $scope.param.service.spec.type = type;
            $scope.param.service.metadata.name = $scope.param.serviceName;
            demo.push($scope.formData.Case);
            $scope.objs=[];
            demo.forEach(function(v){
                for(var i in v){
                    if(v[i] != false){
                        $scope.objs.push(i)
                    }
                }
            });

            // 数据中心 ok
            $scope.dataTrans.dataCenters.forEach(function(elem,index){
                if(elem){
                    $scope.param.dcIdList.push($scope.extentServerLei.dataCenters[index].id);
                }
            });
            $scope.param.service.metadata.labels.name = $scope.param.serviceName;
            $scope.param.service.metadata.labels.author = $scope.sessionName;
            $scope.param.service.metadata.labels.namespace = demoss;
            $scope.param.orgName = demoss;

            // 选择器  
            $scope.Checkeds.forEach(function(v){
                $scope.param.service.spec.selector[v.mylistKey] = v.mylistValue;
            });
            // label **
            $scope.leis.forEach(function(v){
                $scope.param.service.metadata.labels[v.leiKey] = v.leiValue;
            });

            // 端口组  ok  
            $scope.ports.forEach(function(num){
                num.port=Number(num.port);
                num.targetPort=Number(num.targetPort);

                if(num.nodePort != null){
                    num.nodePort=Number(num.nodePort);
                    $scope.amock = num.nodePort;
                }
            });
            /*  提交 post  */
            $scope.param.service.spec.ports = $scope.ports;

            $scope.param.userId = $localStorage.userId;
            $scope.param.orgId = $localStorage.orgId;
            $scope.param.sessionId = $localStorage.sessionId;

            extensionsService.CreatServicePost($scope.param,function(rep){
                if(rep.code == 0){
                    atomicNotifyService.success(rep.message, 2000);
                    $timeout(function() {
                        $state.go('main.extensions');
                    }, 1000);
                }
                else{
                    atomicNotifyService.error(rep.message, 2000);
                }
            },function(rep){
                atomicNotifyService.error(rep.message, 2000);
            });
        };



        //创建访问点
        extensionsService.CreatAccessPoint($scope.myParam,function(data){
            $scope.endpointsData = JSON.parse(data.data);

            if(data.code == 0){
                // add label
                $scope.endleis = [];
                $scope.addendpointjlabel = function(){
                    $scope.endleis.push({});
                };
                // del label
                $scope.delendpointjlabel = function($index){
                    $scope.endleis.splice($index,1);
                };
                // add Ex
                $scope.mockEnd = [];
                $scope.addendpointEx = function(){
                    $scope.mockEnd.push({});
                };
                // del Ex
                $scope.delendpointEx = function($index){
                    $scope.mockEnd.splice($index,1);
                };
            }

            $scope.endpointsJson = {
                "endpointsName": "",
                "orgName": "minimini",
                "dcIdList": [],
                "endpoints": {
                    "kind": "Endpoints",
                    "apiVersion": "v1",
                    "metadata": {    
                        "name": "",
                        "namespace": "",
                        "labels": {
                            "name": "",
                            "author": "",
                            "type" : "endpoints"
                        }
                    },
                    "subsets": []
                }
            };
            $scope.endDataTrans = {
                endDataCenters : []
            };
            var adds = [];
            adds.addresses = [];
            adds.ports = [];

            // 访问点的协议
            $scope.epiPro =[
                "TCP",
                "UDP"
            ];

            // 提交
            $scope.endpointBtn = function(){

                // 数据中心 ok
                $scope.endDataTrans.endDataCenters.forEach(function(elem,index){
                    if(elem){
                        $scope.endpointsJson.dcIdList.push($scope.endpointsData.dataCenters[index].id);
                    }
                });
                $scope.endpointsJson.orgName = $scope.endpointsData.orgName;
                $scope.endpointsJson.endpoints.metadata.namespace = $scope.endpointsData.orgName;

                // 标签组 ok
                $scope.endpointsJson.endpoints.metadata.labels.name = $scope.endpointsJson.endpointsName;
                $scope.endpointsJson.endpoints.metadata.labels.author = $scope.sessionName;
                $scope.endleis.forEach(function(v){
                    for(var i in v){
                        $scope.endpointsJson.endpoints.metadata.labels[v.endlabelKey]=v[i];
                    }
                });

                // 端口及地址
                for(var i = 0; i < $scope.mockEnd.length; i++) {
                    adds.push({
                        addresses : [ 
                            $scope.mockEnd[i].addresses
                        ],
                        ports : [
                            {
                                name : $scope.mockEnd[i].ports.name,
                                protocol : $scope.mockEnd[i].ports.protocol,
                                port : Number($scope.mockEnd[i].ports.port)
                            }
                        ]
                    });
                }

                $scope.endpointsJson.endpoints.subsets = adds;

                $scope.endpointsJson.userId = $localStorage.userId;
                $scope.endpointsJson.orgId = $localStorage.orgId;
                $scope.endpointsJson.sessionId = $localStorage.sessionId;
                $scope.endpointsJson.endpoints.metadata.name = $scope.endpointsJson.endpointsName;

                extensionsService.CreatAccessPointPost($scope.endpointsJson,function(rep){

                    $scope.showstatusMes = true;
                    if(rep.code == 0){
                        atomicNotifyService.success(rep.message, 2000);
                        $timeout(function(){
                            $state.go('main.extensions');
                        },1000);
                    }
                    else{
                        atomicNotifyService.error(rep.message, 2000);
                    }

                },function(rep){
                    atomicNotifyService.error(rep.message, 2000);
                });
            };
        });
    }]; 

    var controllers = [
        {module: 'extensionsManage', name: 'extensionsController', ctrl: ctrl}
    ];
    return controllers;
    }
);