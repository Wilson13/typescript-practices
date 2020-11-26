## Name

Stlog SLIFT Restful APIs Invoker.

Repository name: stlog-sftp-rest-invoker.

## Description

This service is to be used by [AWS Step Function deployed using CDK](https://github.com/fresh-turf/stlog-sftp-workflow-cdk).

Reason is somehow, the nodejs/expressjs lambda wrapped with serverless framework can't be invoked as a lambda, they can only be invoked using Restful methods (GET/POST requests).

Hence, this service is created and it's written in the form of native lambda instead of wrapping around an expressjs application.

## CI/CD

As of now it's deployed manually through `sls deploy`.

## Functions

- sftpSliftProcess

## Reference

- https://github.com/Fresh-Turf/stlog-sftp-workflow-cdk
