'use strict'

/* eslint-env browser */
const { DAGService } = require('./dag')
exports.DAGService = DAGService

const { CoreService } = require('./core')
exports.CoreService = CoreService

const { FilesService } = require('./files')
exports.FilesService = FilesService

const { BlockService } = require('./block')
exports.BlockService = BlockService

const { IPFSService } = require('./service')
exports.IPFSService = IPFSService

const { Server } = require('./server')
exports.Server = Server
