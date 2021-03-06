"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Chunk = undefined;
exports.parseValue = parseValue;

var _events = require("events");

var _info = require("../info");

var _markers = require("../markers");

var MARKER = _interopRequireWildcard(_markers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Universal Binary Format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @module ubf
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Chunk = exports.Chunk = function (_EventEmitter) {
  _inherits(Chunk, _EventEmitter);

  function Chunk(type, value) {
    _classCallCheck(this, Chunk);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Chunk).call(this));

    _this.type = type;
    _this.value = value;
    return _this;
  }

  return Chunk;
}(_events.EventEmitter);

function parseValue() {
  switch (this._readMarker()) {
    // Dict
    case MARKER.VAL_DICTX:
      {
        return beginChunk.call(this, "D", {});
      }
    // List
    case MARKER.VAL_LISTX:
      {
        return beginChunk.call(this, "L", []);
      }
    // String
    case MARKER.VAL_STRX:
      {
        return beginChunk.call(this, "S", []);
      }
    // Binary
    case MARKER.VAL_BINX:
      {
        return beginChunk.call(this, "B", []);
      }
    // Chunks End
    case MARKER.VAL_XENDC:
    case MARKER.VAL_XEND:
      {
        if (this._chunkStack.length) {
          return endChunk.call(this);
        }
        return;
      }
  }
}

function beginChunk(type, value) {
  var chunk = new Chunk(type, value);
  this._chunkStack.push(chunk);
  return this._consume(_info.LEN.MARKER, chunk);
}

function endChunk() {
  var chunk = this._chunkStack.pop();
  var type = chunk.type;
  var value = chunk.value;

  switch (type) {
    case "S":
      {
        value = value.join("");
        break;
      }
    case "B":
      {
        value = Buffer.concat(value);
        break;
      }
  }
  chunk.emit("end", { value: value });
  return this._consume(_info.LEN.MARKER, value);
}