'use strict';

require('../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('../../../lib/core'),
    modelingModule = require('../../../lib/features/modeling'),
    GeometricUtil = require('../../../lib/util/GeometricUtil');


describe('GeometricUtil', function() {


  it('should calculate right horizontal-line/point distance', function() {

    // given
    var a = { x: 1, y: 1},
        b = { x: 4, y: 1};

    var point = { x: 2, y: 4 };

    // when
    var d = GeometricUtil.getDistancePointLine(point, [ a, b ]);

    // then
    expect(d).to.be.equal(3);

  });


});
