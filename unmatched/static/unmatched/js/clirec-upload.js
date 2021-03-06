$(function() {
  "use strict";

  /*jshint camelcase:false*/

  var $clirecDownloadBtn, $clirecUploadBtn, $displayTab, $displayedNostro, $displayedNostroSelector, $modal, $reconsActionSelector, $rowChkBoxSelector, $runReconsAction, $tbody, $uploadTextArea, SINGLE_ROW_ACTIONS, actionCanRun, alertModal, clirecUpload, currentComment, currentLCNumber, dateMonText, disableCtrls, downloadRecords, getChecked, getCheckedRowsInfo, getClirecData, modalContraintObj, modalTemplateFunc, nostroSelectedIndicator, nostroTextSelector, patchRec, processSucceeds, removeTrs, resetActionSelector, setRowComment, setRowRelatedObj, setSuccessMessage, updateInstanceTotal, uploadRecords;

  clirecUpload = {};

  $displayTab = $('#clarec-tab a:last').tab('show');

  $uploadTextArea = $("#clarec-upload-data-text");

  $tbody = $("tbody");

  $modal = $('#unmatched-clirec-modal');

  $rowChkBoxSelector = 'tr[id^=tr-id-]>td>input[type=checkbox]';

  $('table').checkOneAll('.D-S', '#d-s-chk-all');

  $('table').checkOneAll('.C-S', '#c-s-chk-all');

  $('table').checkOneAll('.D-F', '#d-f-chk-all');

  $('table').checkOneAll('.C-F', '#c-f-chk-all');

  $('table').on({
    'click': function() {
      var tag;
      tag = /toggle-hide-clirec-rows-([A-Z-]+)/.exec($(this).prop('class'))[1];
      return $("tr.clirec-instance.tr-" + tag).toggle().find("input[type=checkbox]").prop('checked', false).trigger('change');
    }
  }, 'td[class^=toggle-hide-clirec-rows-]');

  $displayedNostroSelector = $('select#nostro');

  $reconsActionSelector = $('#id_recons_actions');

  $runReconsAction = $('#run-recons-action-btn');

  $reconsActionSelector.on({
    'change': function(evt) {
      if ($(this).val()) {
        return $runReconsAction.prop('disabled', false);
      } else {
        return $runReconsAction.prop('disabled', true);
      }
    }
  });

  resetActionSelector = function() {
    return $reconsActionSelector.val('').prop('disabled', true).trigger('change');
  };

  $displayedNostro = $('#id_clirec_nostro');

  nostroTextSelector = '#id_clirec_nostro_on_deck>div';

  nostroSelectedIndicator = '#kill_undefinedid_clirec_nostro';

  removeTrs = function() {
    return $tbody.children().remove();
  };

  updateInstanceTotal = function() {
    var totalInstances;
    $('.clirec-instance-total').text('Total: 0');
    totalInstances = $('.clirec-instance').size();
    return $('.clirec-instance-total').text("Total: " + totalInstances);
  };

  $clirecDownloadBtn = $('.clarec-download');

  $clirecUploadBtn = $('#clirec-upload-btn');

  disableCtrls = function(flag) {
    $clirecUploadBtn.prop('disabled', flag);
    $clirecDownloadBtn.prop('disabled', flag);
    return $uploadTextArea.prop('disabled', flag);
  };

  $('#id_clirec_nostro_wrapper').on({
    'killed': function(evt) {
      removeTrs();
      updateInstanceTotal();
      resetActionSelector();
      return disableCtrls(true);
    },
    'added': function(evt) {
      disableCtrls(false);
      if (clirecUploadUtils.nostroObj === void 0 || clirecUploadUtils.nostroObj.id !== $displayedNostro.val()) {
        removeTrs();
        updateInstanceTotal();
        resetActionSelector();
        return clirecUploadUtils.setNostroObj($displayedNostro.val());
      }
    }
  }, '#id_clirec_nostro_on_deck');

  $uploadTextArea.on({
    'focusout': function(evt) {
      return $(this).val(function(index, oldVal) {
        return kanmii.strip(oldVal);
      });
    }
  });

  $tbody.on({
    'dblclick': function(evt) {
      return $(this).hide().siblings('.comment').show();
    }
  }, '.clirec-details>.details');

  getClirecData = function($row) {
    var $tds, data;
    $tds = $row.children();
    return data = {
      id: /\d+$/.exec($row.prop('id'))[0],
      amount: $tds.filter('.amount').text(),
      valDate: $tds.filter('.valdate').children('input').val(),
      postDate: $tds.filter('.post-date').children('input').val(),
      lcNumber: $tds.filter('.lc-number').text(),
      clirecDetails: $tds.filter('.clirec-details').children('.details').val(),
      drCr: $tds.filter('.tr-meta-info').children('#d-c').val(),
      swiftFlex: $tds.filter('.tr-meta-info').children('#s-f').val()
    };
  };

  dateMonText = function(dateString) {
    if (!dateString) {
      return null;
    }
    return new Date(dateString).strftime('%d-%b-%Y');
  };

  setRowComment = function($row, comment) {
    $row.find('.comment').val(comment);
    return $row.addClass('commented').removeAttr('title').attr({
      'data-toggle': "tooltip",
      'data-placement': "bottom",
      'title': comment
    });
  };

  setRowRelatedObj = function($tr, record) {
    if (record.comment) {
      setRowComment($tr, record.comment);
    }
    if (record.clirec_obj) {
      return $tr.attr({
        'data-related-object': JSON.stringify({
          clirec_obj: record.clirec_obj,
          content_type: record.content_type,
          object_id: record.object_id
        })
      });
    }
  };

  downloadRecords = function() {
    removeTrs();
    resetActionSelector();
    return $.get("" + clirecUtilUrls.clirecUploadUrl + "?nostro=" + clirecUploadUtils.nostroObj.id + "&show=True").done(function(resp) {
      $displayTab.tab('show');
      if (!resp.length) {
        return window.alert('No record to display.');
      }
      $tbody.html(tbodyHtml(resp));
      return updateInstanceTotal();
    }).fail(function(resp) {
      window.alert('Download failed');
      return console.log(resp);
    });
  };

  uploadRecords = function(dataArray) {
    return $.ajax({
      url: clirecUtilUrls.clirecUploadUrl,
      type: 'POST',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify(dataArray)
    }).done(function(resp) {
      if (!resp.length) {
        window.alert('No record uploaded. May be no new records.');
      }
      return downloadRecords();
    }).fail(function(resp) {
      window.alert('Upload failed. Check console for error details.');
      return console.log(resp);
    });
  };

  $clirecUploadBtn.on({
    "click": function(evt) {
      var correctData, malformedData, nostroNameInText, nostroNumberInText, _ref;
      evt.preventDefault();
      _ref = clirecUploadUtils.parseUploadText(kanmii.strip($uploadTextArea.val())), malformedData = _ref[0], correctData = _ref[1];
      if (malformedData instanceof Error) {
        $uploadTextArea[0].scrollTop = 0;
        nostroNameInText = correctData[0], nostroNumberInText = correctData[1];
        window.alert("Invalid Nostro!\nSelected account: " + clirecUploadUtils.nostroObj.number + " | " + clirecUploadUtils.nostroObj.name + "\n\nAccount in upload text: " + nostroNumberInText + " | " + nostroNameInText);
      } else if (malformedData.length) {
        window.alert("malformedData\n", malformedData);
      } else {
        uploadRecords(correctData);
      }
      return $uploadTextArea.val('');
    }
  });

  $clirecDownloadBtn.click(function(evt) {
    return downloadRecords();
  });

  getChecked = function() {
    return $($rowChkBoxSelector).filter(':checked');
  };

  $tbody.on({
    'change': function(evt) {
      var $el, $tr;
      $el = $(this);
      $tr = $el.parents('tr');
      if ($el.prop('checked')) {
        $tr.addClass('selected');
        return $reconsActionSelector.prop('disabled', false);
      } else {
        $tr.removeClass('selected');
        $tr.find('.comment').hide();
        $tr.find('.details').show();
        if (!getChecked().size()) {
          return resetActionSelector();
        }
      }
    }
  }, $rowChkBoxSelector);

  patchRec = function(url, data) {
    return $.ajax({
      url: url,
      type: 'POST',
      dataType: "json",
      headers: {
        'X-CSRFToken': csrftoken,
        'X-HTTP-METHOD-OVERRIDE': 'PATCH'
      },
      data: data
    });
  };

  modalTemplateFunc = _.template($('#clirec-modal-template').html());

  alertModal = function(msg) {
    $modal.find('.modal-content').html(modalTemplateFunc({
      modalContent: msg
    }));
    return $('#unmatched-clirec-modal').modal('show');
  };

  currentComment = '';

  $tbody.on({
    'dblclick': function(evt) {
      return currentComment = kanmii.strip($(this).prop('readonly', false).val());
    },
    'focusout': function(evt) {
      var $el, $tr, comment;
      $el = $(this).prop('readonly', true);
      comment = kanmii.strip($el.val());
      $el.val(comment);
      if (comment && comment !== currentComment) {
        $tr = $el.parents('tr');
        patchRec($tr.data('url'), {
          comment: comment
        }).done(function(resp) {
          return setRowComment($tr, comment);
        }).fail(function(resp) {
          alertModal('patch of comment failed. Check console for error details.');
          return console.log('patch of comment failed: ', resp);
        });
      }
      return currentComment = '';
    }
  }, 'textarea.comment');

  currentLCNumber = '';

  $tbody.on({
    'dblclick': function(evt) {
      return currentLCNumber = $(this).prop('contenteditable', true).text();
    },
    'focusout': function(evt) {
      var $el, lcNumber;
      $el = $(this).prop('contenteditable', false);
      lcNumber = kanmii.strip($el.text());
      $el.text(lcNumber);
      if (lcNumber && currentLCNumber !== lcNumber) {
        patchRec($el.parents('tr').data('url'), {
          lc_number: lcNumber
        }).done(function(resp) {
          return alertModal("Clirec reference '" + resp.lc_number + "' updated.");
        }).fail(function(resp) {
          alertModal('Clirec reference update failed.\nCheck console for error details.');
          return console.log(resp);
        });
      }
      return currentLCNumber = '';
    }
  }, '.lc-number:not(th)');

  $('body').on({
    'loaded.bs.modal': function(evt) {
      var $this, formName;
      $this = $(this);
      formName = $this.data('bs.modal').options.formName;
      return $.ajax({
        url: "/static/unmatched/js/clirec-modals/" + formName + ".js",
        dataType: 'script',
        cache: true,
        success: function(data) {
          return $this.modal({
            show: true
          });
        }
      });
    },
    'hidden.bs.modal': function(evt) {
      var $el;
      $el = $(this);
      return $el.removeData('bs.modal').find('.modal-content').children().remove();
    }
  }, '#unmatched-clirec-modal');

  clirecUpload.deleteRecords = function(rowObj, ids, url) {
    var rec;
    rec = ids.length === 1 ? 'record' : 'records';
    if (window.confirm("Are you sure you want to delete selected " + ids.length + " " + rec + "?")) {
      return $.ajax({
        url: url,
        type: 'POST',
        dataType: "json",
        headers: {
          'X-CSRFToken': csrftoken,
          'X-HTTP-METHOD-OVERRIDE': 'DELETE'
        },
        data: JSON.stringify({
          multiple_delete_ids: ids
        }),
        contentType: "application/json; charset=utf-8"
      }).done(function(resp) {
        var id, len_records, msg, _i, _len, _ref;
        len_records = resp.deleted_ids.length;
        msg = len_records === 1 ? 'record' : 'records';
        window.alert("" + len_records + " " + msg + " deleted.");
        _ref = resp.deleted_ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          rowObj[id].remove();
        }
        resetActionSelector();
        return updateInstanceTotal();
      }).fail(function(resp) {
        window.alert('Delete failed. Server error.');
        return console.log(resp);
      });
    }
  };

  setSuccessMessage = function(respObj) {
    var $modalBody;
    $modalBody = $modal.find('.modal-body');
    $modalBody.children().remove();
    $modalBody.append($("<p class=\"process-successful-msg\">" + respObj.msg + "</p>"));
    if (respObj.summaryText) {
      return $modalBody.append($("<textarea style=\"display:block; width:100%\" rows=\"10\">\n" + respObj.summaryText + "</textarea>"));
    }
  };

  processSucceeds = function($tr, successResp) {
    var errorArray, error_mgs, fieldName;
    if (successResp.form_errors) {
      error_mgs = '';
      for (fieldName in successResp) {
        errorArray = successResp[fieldName];
        if (fieldName !== 'form_errors') {
          error_mgs += "" + fieldName + ":   " + errorArray + "\n";
        }
      }
      return window.alert("Form errors\n" + error_mgs);
    }
    setSuccessMessage(successResp);
    $tr.addClass('processed');
    if (successResp.ref) {
      $tr.children('.lc-number').text(successResp.ref);
    }
    return $.ajax({
      url: $tr.data('url'),
      type: 'GET',
      dataType: "json",
      success: function(resp) {
        $tr.children('.date-processed').text(dateMonText(resp.date_upload_processed));
        return setRowRelatedObj($tr, resp);
      },
      error: function(resp) {
        return console.log(resp);
      }
    });
  };

  getCheckedRowsInfo = function(checkedEl) {
    var $el, $thisRow, checker, id, ids, rows, tr, url, _i, _len, _ref;
    $el = $(checkedEl);
    $thisRow = $el.parents('tr');
    url = $thisRow.data('url');
    rows = {};
    ids = [];
    _ref = getChecked();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      checker = _ref[_i];
      tr = $(checker).parents('tr');
      id = Number(/\d+$/.exec(tr.prop('id'))[0]);
      rows[id] = tr;
      ids.push(id);
    }
    return {
      rows: rows,
      ids: ids,
      url: url,
      $thisRow: $thisRow
    };
  };

  modalContraintObj = {
    charge: {
      drCr: 'D',
      swiftFlex: 'S',
      errorMsg: 'Charge can only be created for statement debit.'
    },
    lccovermovement: {
      drCr: 'C',
      swiftFlex: 'S',
      errorMsg: 'You can only post entries for statement credits as LC cover movement.'
    },
    lcundrawnbalance: {
      drCr: 'C',
      swiftFlex: 'S',
      errorMsg: 'You can only create undrawn balance for statement credits.'
    },
    'ubuk-depo-1gbp-26': {
      drCr: 'C',
      swiftFlex: 'S',
      errorMsg: 'Ubuk deposit 1 action can only be applied to statement credits.'
    }
  };

  actionCanRun = function(action, $row) {
    var clirecDataObj, constraint;
    if (_.has(modalContraintObj, action)) {
      clirecDataObj = getClirecData($row);
      constraint = modalContraintObj[action];
      if (constraint.drCr === clirecDataObj.drCr && constraint.swiftFlex === clirecDataObj.swiftFlex) {
        return true;
      } else {
        return alert(constraint.errorMsg);
      }
    }
    return true;
  };

  SINGLE_ROW_ACTIONS = ['availment', 'charge', 'lccovermovement', 'lcundrawnbalance'];

  $runReconsAction.click(function(evt) {
    var $thisRow, action, checkedBoxes, ids, numBoxes, rows, url, _ref;
    action = $reconsActionSelector.val();
    checkedBoxes = getChecked();
    numBoxes = checkedBoxes.size();
    if (numBoxes > 1 && _.contains(SINGLE_ROW_ACTIONS, action)) {
      window.alert("'" + action + "' can only be applied to a single row.\n" + numBoxes + " rows selected.");
      resetActionSelector();
      return checkedBoxes.prop('checked', false).trigger('change');
    }
    _ref = getCheckedRowsInfo(checkedBoxes[0]), rows = _ref.rows, ids = _ref.ids, $thisRow = _ref.$thisRow, url = _ref.url;
    if (action === 'delete') {
      return clirecUpload.deleteRecords(rows, ids, url);
    }
    if (actionCanRun(action, $thisRow) === true) {
      return $('#unmatched-clirec-modal').modal({
        backdrop: false,
        formName: action,
        remote: clirecUploadUtils.getModalActionUrl(action)
      });
    }
  });

})
