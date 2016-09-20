/**
 * Created by Jora on 2016/7/29.
 */
define([
        'base64'
    ], function(Base64){
    'use strict';

    var ctrl = ['$scope','$http','$localStorage', function($scope,$http,$localStorage){
        var userId = $localStorage.userId;
        var orgId = $localStorage.orgId;
        var sessionId = $localStorage.sessionId;
        $scope.sessionName = $localStorage.userName;

        //  服务管理页面
        $http({
            url : '/api/v1/organizations/'+orgId+'/users/'+userId+'/extensions',
            method : 'GET',
            headers : {sessionId}
        })
        .success(function(data){
            if(data.code == 0){
                $scope.newExtensions = JSON.parse(data.data);
                var NewExtensions = JSON.parse(data.data);
                NewExtensions.forEach(function(v){
                    for(var itemLength in v.serviceList.items){ }
                    $scope.itemLength = itemLength;
                });

                /*  点击服务的删除 */
                $scope.alertBox1 = false;   //  alert的文本框
                $scope.delItem = function(dcIds,item){
                    $scope.alertBox1 = !false;
                    /*  确定删除按钮  内为删除函数  */
                    $scope.extnesionsDel = function(){
                        $scope.alertBox1 = false;
                        var serverNP = item.spec.ports[0].nodePort;
                        var lebelType = item.metadata.labels.type;
                        var serversName = String(item.metadata.name);
                        var nodePorts = String(serverNP);
                        var np = {
                            nodePort : ""
                        } 
                        np.nodePort = nodePorts;
                        if(lebelType == "service"){
                            $http({
                                url : '/api/v1/organizations/'+orgId+'/datacenters/'+dcIds+'/users/'+userId+'/services/'+serversName,
                                method : 'DELETE',
                                headers : np
                            }).success(function(){})
                            .error(function(data) {
                                alert("lose");
                            });
                        }
                    }
                    /*  取消删除按钮  */
                    $scope.extnesionsBack = function(){
                        console.log("quxiao")
                        $scope.alertBox1 = false;
                    }
                }

                /*  点击访问点的删除 */
                $scope.cutItem = function(dcIds,item){
                    $scope.alertBox1 = !false;
                    /*  确定删除按钮  内为删除函数  */
                    $scope.extnesionsDel = function(){
                        $scope.alertBox1 = false;
                        var lebelType = item.metadata.labels.type;
                        var serversName = String(item.metadata.name);
                        if(lebelType == "endpoint"){
                            $http({
                                url : '/api/v1/organizations/'+orgId+'/datacenters/'+dcIds+'/endpoints/'+serversName,
                                method : 'DELETE'
                            })
                            .success(function(){})
                            .error(function(data) {
                                alert("lose");
                            });
                        }  
                    }
                    /*  取消删除按钮  */
                    $scope.extnesionsBack = function(){
                        console.log("quxiao")
                        $scope.alertBox1 = false;
                    }
                }
            }
        })
        .error(function(){
            if(data.code != 0){
                alert(data.message);
            }
        })

        //  创建服务   GET
        $http({
            url : '/api/v1/organizations/'+orgId+'/users/'+userId+'/services/init',
            method : 'GET'
        })
        .success(function(data){
            $scope.extentServers = data;
            var extentServers = data;
            $scope.extentServerLei = JSON.parse($scope.extentServers.data);
            var demoss = $scope.extentServerLei.orgName;
            if($scope.extentServers.code == 0){
                    $scope.serverClick1 = function(){
                        if($scope.serverRadios == 1){
                            $scope.serverDisabled = false;
                        }else if($scope.serverRadios == 0){
                            $scope.serverDisabled = true;
                        }
                    }
                    //   label add....
                    $scope.leis = [];
                    $scope.addLabels = function(){
                        $scope.leis.push({})
                    }
                    //   del
                    $scope.delLabels = function($index){
                        $scope.leis.splice($index,1)
                    }

                    //   port add....
                    $scope.ports = [];
                    $scope.addPort = function(){
                        $scope.ports.push({});
                    }
                    //   del
                    $scope.delPort = function($index){
                        $scope.ports.splice($index,1)
                    }

           }
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

            $scope.formData={}
            var demo = [];
            $scope.mocks ={};
            $scope.dataTrans = {
                dataCenters : []
            };
            $scope.serversubmit = function(){
                // 服务类型  ok
                var type = "";
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
                    })

                // 数据中心 ok
                $scope.dataTrans.dataCenters.forEach(function(elem,index){
                    if(elem){
                        $scope.param.dcIdList.push($scope.extentServerLei.dataCenters[index].id);
                    }
                })
                $scope.param.service.metadata.labels.name = $scope.param.serviceName;
                $scope.param.service.metadata.labels.author = $scope.sessionName;
                $scope.param.service.metadata.labels.namespace = demoss;
                $scope.param.orgName = demoss;

                // 选择器  ok
                $scope.param.service.spec.selector[$scope.mocks.mylistKey] = $scope.mocks.mylistValue

                // label
                $scope.leis.forEach(function(v){
                    for(var i in v){
                        $scope.param.service.metadata.labels[v.leiKey]=v[i]
                    }
                })

                // 端口组  ok  
                $scope.ports.forEach(function(num){
                    num.port=Number(num.port);
                    num.targetPort=Number(num.targetPort);

                    if(num.nodePort != null){
                        num.nodePort=Number(num.nodePort);
                    }
                })

                /*  提交 post  */
                $scope.param.service.spec.ports = $scope.ports;
                $http.post('/api/v1/organizations/'+orgId+'/users/'+userId+'/services/new', $scope.param).success(function(){
                    alert("ok")
                }).error(function(data) {
                    alert("lose");
                });
            }
        })
        .error(function(){
            alert(extentServers.message);
        })


        //  创建访问点  GET

        $http({
            url : '/api/v1/organizations/'+orgId+'/users/'+userId+'/endpoints/init',
            method : 'GET'
        })
        .success(function(data){
            $scope.endpointsData = JSON.parse(data.data);
            if(data.code == 0){
                // add label
                $scope.endleis = [];
                $scope.addendpointjlabel = function(){
                    $scope.endleis.push({})
                }
                // del label
                $scope.delendpointjlabel = function($index){
                    $scope.endleis.splice($index,1);
                }
                // add Ex
                $scope.mockEnd = [];
                $scope.addendpointEx = function(){
                    $scope.mockEnd.push({});
                }
                // del Ex
                $scope.delendpointEx = function($index){
                    $scope.mockEnd.splice($index,1);
                }
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
                            "type" : "endpoint"
                        }
                    },
                    "subsets": []
                }
            }
            $scope.endDataTrans = {
                endDataCenters : []
            };
            var adds = [];
            adds.addresses = [];
            adds.ports = [];

            // 提交
            $scope.endpointBtn = function(){

                // 数据中心 ok
                $scope.endDataTrans.endDataCenters.forEach(function(elem,index){
                    if(elem){
                        $scope.endpointsJson.dcIdList.push($scope.endpointsData.dataCenters[index].id)
                    }
                })
                $scope.endpointsJson.orgName = $scope.endpointsData.orgName;
                $scope.endpointsJson.endpoints.metadata.namespace = $scope.endpointsData.orgName;

                // 标签组 ok
                $scope.endpointsJson.endpoints.metadata.labels.name = $scope.endpointsJson.endpointsName;
                $scope.endpointsJson.endpoints.metadata.labels.author = $scope.sessionName;
                $scope.endleis.forEach(function(v){
                    for(var i in v){
                        $scope.endpointsJson.endpoints.metadata.labels[v.endlabelKey]=v[i]
                    }
                })

                // 选择器
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
                $scope.endpointsJson.endpoints.metadata.name = $scope.endpointsJson.endpointsName;

                //  提交 post
                $http.post('/api/v1/organizations/'+orgId+'/users/'+userId+'/endpoints/new', $scope.endpointsJson).success(function(){
                    alert("ok")
                }).error(function(data) {
                    alert("lose");
                });
            }
        })
        .error(function(){
            console.log("lose");
        })

    }]; 

    var controllers = [
        {module: 'extensionsManage', name: 'extensionsController', ctrl: ctrl}
    ];
    return controllers;
    }
);