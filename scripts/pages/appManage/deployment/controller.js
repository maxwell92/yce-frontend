/**
 * Created by Jora on 2016/7/29.
 */
define([
        'base64'
    ], function(Base64){
        'use strict';

        var ctrl = ['$scope','$http','deploymentService','$localStorage', '$rootScope', '$state', function($scope,$http, deploymentService, $localStorage, $rootScope, $state){

            $scope.param = {
                orgId: $localStorage.orgId,
                userId: $localStorage.userId,
                sessionId: $localStorage.sessionId,
                dcIdList : [],
                deployment : {
                    metadata : {
                        name : '',
                        namespace : '',
                        labels : {}
                    },
                    spec : {
                        template : {
                            spec : {
                                containers : [{
                                    env : [],
                                    image : '', 
                                    resources : {
                                        limits : {}
                                    },
                                    ports: [
                                      {
                                        name: '',
                                        hostPort: {},
                                        containerPort: {},
                                        protocol: '',
                                        hostIP: ''
                                      }
                                    ]
                                }]
                            }
                        }
                    }
                }
            };
            $scope.dataTrans = {
                dataCenters : [],
                labels : [],
                quotas : '',
                author : $localStorage.userName
            };
            $scope.stepNum = 1;

            deploymentService.getDeploymentIint({
                sessionId : $localStorage.sessionId,
                orgId : $localStorage.orgId,
                userId :$localStorage.userIid
            },function(data){
                if(data.code == 0){
                    $scope.initData = JSON.parse(data.data);
                    $scope.param.deployment.metadata.namespace = $scope.initData.orgName;
                    $scope.param.orgName = $scope.initData.orgName;
                    $scope.dataTrans.quotas = $scope.initData.quotas[0].id;
                }
                $scope.nextStep = function(stepNum){
                    $scope.stepNum = stepNum;
                };
            });

            /*添加标签*/
            $scope.addLabel = function(){
                $scope.dataTrans.labels.push({key:'',value:''});
            };
            /*删除标签*/
            $scope.deleteLabel = function($index){
                $scope.dataTrans.labels.splice($index,1);
            };

            /*添加环境变量*/
            $scope.addEnv = function(){
                $scope.param.deployment.spec.template.spec.containers[0].env.push({name:'',value:''});
            };
            /*删除环境变量*/
            $scope.deleteEnv = function($index){
                $scope.param.deployment.spec.template.spec.containers[0].env.splice($index,1);
            };
            /*选择镜像*/
            $scope.showImageSelector = function(){
                $scope.imageSelectorConf = {
                    widgetId : 'widgetImageSelector',
                    widgetTitle : '选择镜像',
                    isImageSelector: true
                };
                $rootScope.widget.widgetImageSelector = true;
            };
            $scope.version = "";
            /*监听imageSelector(子)页面的emit*/
            $scope.$on('imageSelector',function(event, data){
                $scope.param.deployment.spec.template.spec.containers[0].image = data;
                $rootScope.widget.widgetImageSelector = false;
                $scope.version = data.split(":")[2];
            });

            $scope.portLists = [
                {protocol: "TCP"}
            ];
            $scope.addportL = function(){
                $scope.portLists.push({});
            } 
            $scope.delportL = function($index){
                $scope.portLists.splice($index,1)
            }
            $scope.activities =[
                "TCP",
                "UDP"
            ];

            /*提交表单*/
            $scope.submit = function(){

                $scope.portLists.forEach(function(m){
                    m.containerPort = Number(m.containerPort);
                })
                
                $scope.param.deployment.spec.template.spec.containers[0].ports = $scope.portLists;

                $scope.param.deployment.metadata.labels = {
                    "name" : $scope.param.deployment.metadata.name,
                    "author" : $localStorage.userName,
                    "version" : $scope.version
                };
                $scope.param.appName = $scope.param.deployment.metadata.name;
                $scope.dataTrans.dataCenters.forEach(function(elem, index){
                    if(elem){
                        $scope.param.dcIdList.push($scope.initData.dataCenters[index].id);
                    }
                });
                $scope.dataTrans.labels.forEach(function(elem,index){
                    $scope.param.deployment.metadata.labels[elem.key] = elem.value;
                });
                var limits = $scope.initData.quotas.filter(function(item){
                    return item.id == $scope.dataTrans.quotas;
                })[0];
                $scope.param.deployment.spec.template.spec.containers[0].resources.limits = {
                    cpu : limits.cpu + '000m',
                    memory : limits.mem + '000M'
                };

                $scope.param.deployment.spec.template.metadata = {
                    labels : $scope.param.deployment.metadata.labels
                };

                $scope.param.deployment.spec.template.spec.containers[0].name = $scope.param.deployment.metadata.name;

                deploymentService.deploymentSubmit($scope.param,function(data){
                    alert('提交成功');
                    $state.go('main.appManage')
                },function(){
                    alert('提交失败');
                });
            };

            // Image
            $http({
                method: 'GET',
                url: '/api/v1/registry/images'
            })
            .success(function(data) {
                var dataObject = JSON.parse(data.data);

                // make new images:tags
                var imageArr = new Array();
                var k = 0
                for (var i in dataObject) {
                    var list = dataObject[i].tags;
                    for (var j in list) {
                        imageArr[k] = dataObject[i].name + ":" + list[j];
                        k=k+1
                    }
                }

                $scope.imageList=imageArr;
                $scope.getImages = function(x) {
                    $scope.param.deployment.spec.template.spec.containers[0].image=x;
                    x.replace(/:(\S+)$/,function($0,$1){
                        $scope.param.deployment.metadata.labels.version = $1;
                    });
                }


            })
            .error(function() {
                console.log("getImages error")
            })
        }];
        var controllers = [
            {module: 'appManage', name: 'deploymentController', ctrl: ctrl}
        ];

        return controllers;
    }
);

