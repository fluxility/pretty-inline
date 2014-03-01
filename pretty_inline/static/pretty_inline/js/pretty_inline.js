/**
 * Pretty inline
 *
 * Based on Django admin inlines
 * @author Jeffrey de Lange
 * @requires jQuery UI
 */
(function ($) {
    $.fn.baseFormset = function (opts) {
        var options = $.extend({}, $.fn.baseFormset.defaults, opts);
        var $this = $(this);
        var $parent = $this.parent();

        options.totalForms = $("#id_" + options.prefix + "-TOTAL_FORMS").prop("autocomplete", "off");
        options.nextIndex = parseInt(options.totalForms.val(), 10);
        options.maxForms = $("#id_" + options.prefix + "-MAX_NUM_FORMS").prop("autocomplete", "off");
        // only show the add button if we are allowed to add more items,
        // note that max_num = None translates to a blank string.
        options.showAddButton = options.maxForms.val() === '' || (options.maxForms.val() - options.totalForms.val()) > 0;

        $this.each(function (i) {
            $(this).not("." + options.emptyCssClass).addClass(options.formCssClass);
        });

        if ($this.length && options.showAddButton) {
            var addButton;
            if ($this.prop("tagName") == "TR") {
                // If forms are laid out as table rows, insert the
                // "add" button in a new table row:
                var numCols = this.eq(-1).children().length;
                $parent.append('<tr class="' + options.addCssClass + '"><td colspan="' + numCols + '"><a href="javascript:void(0)">' + options.addText + "</a></tr>");
                addButton = $parent.find("tr:last a");
            } else {
                // Otherwise, insert it immediately after the last form:
                $this.filter(":last").after('<div class="' + options.addCssClass + '"><a href="javascript:void(0)">' + options.addText + "</a></div>");
                addButton = $this.filter(":last").next().find("a");
            }
            addButton.click(function (e) {
                e.preventDefault();
                var totalForms = $("#id_" + options.prefix + "-TOTAL_FORMS");
                var template = $("#" + options.prefix + "-empty");

                var row = options.create_new_row(template);
                options.add_delete_button(row);

                // Insert the new form when it has been fully edited
                row.insertBefore($(template));
                // Update number of total forms
                $(totalForms).val(parseInt(totalForms.val(), 10) + 1);
                options.nextIndex += 1;

                // Hide add button in case we've hit the max, except we want to add infinitely
                if ((options.maxForms.val() !== '') && (options.maxForms.val() - options.totalForms.val()) <= 0) {
                    addButton.parent().hide();
                }

                row.find("a." + options.deleteCssClass).click(function (e){options.deleteClick(e, row)});
                // If a post-add callback was supplied, call it with the added form:
                if (options.added) {
                    options.added(row);
                }
            });
            options.addButton = addButton;
        }

        if (options.onSubmit) {
            $this.closest('form').on('submit', options.onSubmit);
        }
        return this;
    };

    $.fn.baseFormset.defaults = {
        prefix: "form",          // The form prefix for your django formset
        addText: "add another",      // Text for the add link
        deleteText: "remove",      // Text for the delete link
        addCssClass: "add-row",      // CSS class applied to the add link
        deleteCssClass: "delete-row",  // CSS class applied to the delete link
        emptyCssClass: "empty-row",    // CSS class applied to the empty row
        formCssClass: "dynamic-form",  // CSS class applied to each form in a formset
        added: null,          // Function called each time a new form is added
        removed: null,          // Function called each time a form is deleted
        onSubmit: null,

        add_delete_button : function(row) {
            if (row.is("tr")) {
                // If the forms are laid out in table rows, insert
                // the remove button into the last table cell:
                row.children(":last").append('<div><a class="' + this.deleteCssClass + '" href="javascript:void(0)">' + this.deleteText + "</a></div>");
            } else if (row.is("ul") || row.is("ol")) {
                // If they're laid out as an ordered/unordered list,
                // insert an <li> after the last list item:
                row.append('<li><a class="' + this.deleteCssClass + '" href="javascript:void(0)">' + this.deleteText + "</a></li>");
            } else {
                // Otherwise, just insert the remove button as the
                // last child element of the form's container:
                row.children(":first").append('<span><a class="' + this.deleteCssClass + '" href="javascript:void(0)">' + this.deleteText + "</a></span>");
            }
        },

        create_new_row: function(template) {
            var options = this;
            var row = template.clone(true);
            row.removeClass(options.emptyCssClass)
                .addClass(options.formCssClass)
                .attr("id", options.prefix + "-" + options.nextIndex);

            row.find("*").each(function () {
                options.updateElementIndex(this, options.prefix, options.totalForms.val());
            });
            return row;
        },

        remove_row: function (row) {
            console.log('remove_row');
            var options = this;
            row.remove();
            this.nextIndex -= 1;
            // If a post-delete callback was provided, call it with the deleted form:
            if (options.removed) {
                options.removed(row);
            }
            // Update the TOTAL_FORMS form count.
            var forms = $("." + options.formCssClass);
            $("#id_" + options.prefix + "-TOTAL_FORMS").val(forms.length);
            // Show add button again once we drop below max
            if ((options.maxForms.val() === '') || (options.maxForms.val() - forms.length) > 0) {
                options.addButton.parent().show();
            }
            // Also, update names and ids for all remaining form controls
            // so they remain in sequence:
            for (var i = 0, formCount = forms.length; i < formCount; i++) {
                this.updateElementIndex($(forms).get(i), options.prefix, i);
                $(forms.get(i)).find("*").each(function () {
                    options.updateElementIndex(this, options.prefix, i);
                });
            }
        },

        deleteClick: function (e, row) {
            console.log('deleteClick');
            e.preventDefault();
            // Remove the parent form containing this button:
            this.remove_row(row);
        },

        updateElementIndex: function (el, prefix, ndx) {
            var id_regex = new RegExp("(" + prefix + "-(\\d+|__prefix__))");
            var replacement = prefix + "-" + ndx;
            if ($(el).prop("for")) {
                $(el).prop("for", $(el).prop("for").replace(id_regex, replacement));
            }
            if (el.id) {
                el.id = el.id.replace(id_regex, replacement);
            }
            if (el.name) {
                el.name = el.name.replace(id_regex, replacement);
            }
        }
    };
    $.fn.prettyFormset = function (options) {
        var $rows = $(this);
        var updateInlineLabel = function (row) {
            $($rows.selector).find(".inline_label").each(function (i) {
                var count = i + 1;
                $(this).html($(this).html().replace(/(#\d+)/g, "#" + count));
            });
        };

        var reinitDateTimeShortCuts = function () {
            // Reinitialize the calendar and clock widgets by force, yuck.
            if (typeof DateTimeShortcuts != "undefined") {
                $(".datetimeshortcuts").remove();
                DateTimeShortcuts.init();
            }
        };

        var updateSelectFilter = function () {
            // If any SelectFilter widgets were added, instantiate a new instance.
            if (typeof SelectFilter != "undefined") {
                $(".selectfilter").each(function (index, value) {
                    var namearr = value.name.split('-');
                    SelectFilter.init(value.id, namearr[namearr.length - 1], false, options.adminStaticPrefix);
                });
                $(".selectfilterstacked").each(function (index, value) {
                    var namearr = value.name.split('-');
                    SelectFilter.init(value.id, namearr[namearr.length - 1], true, options.adminStaticPrefix);
                });
            }
        };

        var initPrepopulatedFields = function (row) {
            row.find('.prepopulated_field').each(function () {
                var field = $(this),
                    input = field.find('input, select, textarea'),
                    dependency_list = input.data('dependency_list') || [],
                    dependencies = [];
                $.each(dependency_list, function (i, field_name) {
                    dependencies.push('#' + row.find('.form-row .field-' + field_name).find('input, select, textarea').attr('id'));
                });
                if (dependencies.length) {
                    input.prepopulate(dependencies, input.attr('maxlength'));
                }
            });
        };


        opts = $.extend({}, $.fn.baseFormset.defaults, {
            prefix: options.prefix,
            addText: options.addText,
            formCssClass: "dynamic-" + options.prefix,
            deleteCssClass: "inline-deletelink",
            deleteText: options.deleteText,
            emptyCssClass: "empty-form",
            removed: updateInlineLabel,
            add_delete_button: function(row) {
                row.find('.actions').append('<div><a class="' + this.deleteCssClass + '" href="javascript:void(0)">' + this.deleteText + "</a></div>");
            },
            deleteClick: function (e, row) {
                e.preventDefault();

                row.addClass('deleted');
                row.css('background', 'red')
            },
            added: (function (row) {
                initPrepopulatedFields(row);
                reinitDateTimeShortCuts();
                updateSelectFilter();
                updateInlineLabel(row);
//                row.find('tr:first').hide();
//                row.find('tr:last').show();
            }),
            onSubmit: function(e)
            {
                e.preventDefault();
                console.log(e);
                $(this).filter('.delete').each(function () {

                    remove_row($(this));
                });
            }
        });

        $rows.baseFormset(opts);

        return $rows;
    };
})(django.jQuery);