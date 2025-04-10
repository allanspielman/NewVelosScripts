/*
    The function below, given an complex condition object, and a complex action object can
    check if the condition is valid and call different actions on many different objects

    here is the options for an conditon
    condition type -> "single" or "multiple"
    comparison type -> "==", "!=", "<", ">", "<=", ">=", "null", "not null"

    
    an example CONDITION OBJECT (the first parameter) is given below:
    this object allows the use of complex nested conditions
    giving more flexibility to customize when you want the action to occur than the simple 1-condition velos logic

    {
        type: "multiple", 
        condition: "or", 
        data:
        [
            {
                type: "multiple",
                condition: "and",
                data:
                [
                    {
                        type: "single",
                        data: {
                            field: 1,
                            type: "==",
                            values: ["hi"]
                        }
                    },
                    {
                        type: "single",
                        data: {
                            field: 2,
                            type: ">",
                            values: [5]
                        }
                    }
                ]
            },
            {
                type: "single",
                data: {
                    field: 1,
                    type: "=="
                    values: ["bye"]
                }
            }
        ]
    }



    below is an example condition of an ACTION OBJECT:
    this allows you to customize any number of actions on any number of fields
    much more flexibility than what velos's function allowed, one action performed on any number of fields

    read-only, disabled, and hidden follow from their name and affect the field's properties
    highlighted will change the field's background color to yellow, this can be used to flag invalid fields that the user needs to update
    additionally, it is always possible to implement new action types, for example differnt highlight colors or making the field text bold, etc

    fields is an array, formatted the same as in the velos function

    [
        {
            type: "read only",
            fields: []
        },
        {
            type: "disable",
            fields: []
        },
        {
            type: "hide",
            fields: []
        },
        {
            type: "highlight",
            fields: []
        }
    ]
*/

/*

EXAMPLE:

below is the code velos would generate for a condition that sets the visibility of one field
depending on whether another field is set to 'Yes' or 'No'
in this example the target field is hidden if the source field is 'No' and visible if it is 'Yes'
** comments have been added to the code below to clarify the process

if (actualField.name == 'fld10050_26073_29671') {        
    var srcArr = new Array();
    var targetArr = new Array();
    var conditionValArr = new Array();
    var conditionType;
    var actionType;
    var fld;

    fld = formobj.fld10050_26073_29671 ; // the source field
    conditionType = "velEquals" ; // condition being checked (in this case are they equal)
    actionType = "hidden" ; // the action being performed, in this case hiding the target field
    targetArr[0] = formobj.fld10050_26079_29677 ; // the target field or fields
    conditionValArr[0] = "No" ; // the value that we are checking the conditon against (in this case, looking for it to be equal to 'No')

    changeFieldStateMultiple(fld,conditionType,conditionValArr,targetArr,actionType);
}

this next block is what the same condition would look like using the new system
this code has been spaced out for readability, it can of course be combined into one line
** comments have been added to clarify the process below

if (actualField.name == 'fld10050_26073_29671') {
    checkConditions(
        {
            // we are checking a single condition meaning, we only care about one source field being equal, not equal, etc, to one or multiple values
            type: "single",
            data: {
                field: formobj.fld10050_26073_29671, // this is the source field we are checking ('fld' in the old velos function)
                type: "==", // this is the type of condition. can be ==, !=, <=, etc ('conditionType' in the old velos function)
                values: ["No"] // these are the values we are checking against ('conditionValArr' in the old velos function)
            }
        [
            {
                type: "hide", // this is the type of action ('actionType' in the old velos function)
                fields: [formobj.fld10050_26079_29677] // these are the target fields ('targetArr' in the old velos function)
            }
        ])  
}

this is a simple example, the main benefit of our function is with larger more complex conditions

*/

/*
    TODO:
    * add better error logging and handling for invalid params
    * possibly add handling for some common issues (entering "equals" instead of "==")
    * create a full guide doc
*/

function checkConditions(conditionObject, actionObject)
{
    const conditions = 
    {
        "==": (field, fieldValue, fieldLength, acceptableValues) => {
            fieldValue = fieldValue.toLowerCase();

            // loop through each of the acceptable values for the field
            for (let acceptableValue of acceptableValues)
            {
                acceptableValue = acceptableValue.toLowerCase();

                if (fieldLength == 0)
                {
                    if (fieldValue == acceptableValue) 
                    {
                        // field is empty, but that is acceptable
                        return true;
                    }
                    else
                    {
                        try
                        {
                            // if both fields are numerical and they are equal
                            if (!isNaN(Number(fieldValue)) && !isNaN(acceptableValue) && (Number(fieldValue) == Number(acceptableValue))) return true;
                            else
                            {
                                // not really sure honestly, some type of currency test
                                var myDigitGroupSymbol = $j.formatCurrency.regions[appNumberLocale].digitGroupSymbol;
                                var fld1textcleaned = fieldValue.replace(myDigitGroupSymbol, "");
                                var fld1valcleaned = acceptableValue.replace(myDigitGroupSymbol, "");

                                if (!isNaN(fld1textcleaned) && !isNaN(fld1valcleaned) && Number(fld1textcleaned) == Number(fld1valcleaned)) return true;
                            }
                        }
                        catch(e) {}
                    }
                }
                else
                {
                    for (let k = 0; k < fieldLength; k++)
                    {
                        // if field is a checkbox, use field id or value to compare (handles differing html input properties)
                        if (field[k].checked)
                        {
                            if (v_displayvalflag == 1) fieldValue = field[k].id;
                            else fieldValue = field[k].value;
                            
                            fieldValue = fieldValue.toLowerCase();
                                                                
                            if (fieldValue == acceptableValue) 
                            {	
                                return true;
                            }
                        }
                    }
                }
            }
            
            return false;
        },
        "!=": (field, fieldValue, fieldLength, acceptableValues) => {
            fieldValue = fieldValue.toLowerCase();
        
            for (let acceptableValue of acceptableValues)
            {
                acceptableValue = acceptableValue.toLowerCase();
    
                if (fieldLength == 0)
                {
                    if (fieldValue != acceptableValue) 
                    {	
                        return true;
                    }
                }
                else
                {
                    for (var k = 0; k < fieldLength; k++)
                    {
                                            
                        if (field[k].checked)
                        {
                            if (v_displayvalflag == 1)
                            {
                                fieldValue = field[k].id;
                            }
                            else
                            {
                                fieldValue = field[k].value;
                            }
        
                            fieldValue = fieldValue.toLowerCase();
                                                                
                            if (fieldValue != acceptableValue) 
                            {	
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        },
        ">": (field, fieldValue, fieldLength, acceptableValues) => {
            for (let acceptableValue of acceptableValues)
            {
                if (fieldLength == 0)
                {
                    if (isDecimal(fieldValue) && isDecimal(acceptableValue))
                    { 
                        if (parseFloat(fieldValue) > parseFloat(acceptableValue)) 
                        {
                            return true;
                        }
                    }	
                }
                else
                {
                    for (var k = 0; k < fieldLength; k++)
                    {
                                            
                        if (field[k].checked)
                        {
                            if (v_displayvalflag == 1)
                            {
                                fieldValue = field[k].id;
                            }
                            else
                            {
                                fieldValue = field[k].value;
                            }

                            if (isDecimal(fieldValue) && isDecimal(acceptableValue))
                            { 
                                if (parseFloat(fieldValue) > parseFloat(acceptableValue)) 
                                {
                                    return true;
                                }
                            }																	
                        }
                    }
                }
            }

            return false;
        },
        "<": (field, fieldValue, fieldLength, acceptableValues) => {
            for (let acceptableValue of acceptableValues)
            {
                if (fieldLength == 0)
                {
                    if (isDecimal(fieldValue) && isDecimal(acceptableValue))
                    { 
                        if (parseFloat(fieldValue) < parseFloat(acceptableValue)) 
                        {
                            return true;
                        }
                    }	
                }
                else
                {
                    for (var k = 0; k < fieldLength; k++)
                    {
                                            
                        if (field[k].checked)
                        {
                            if (v_displayvalflag == 1)
                            {
                                fieldValue = field[k].id;
                            }
                            else
                            {
                                fieldValue = field[k].value;
                            }
    
                            if (isDecimal(fieldValue) && isDecimal(acceptableValue))
                            { 
                                if (parseFloat(fieldValue) < parseFloat(acceptableValue)) 
                                {
                                    return true;
                                }
                            }																	
                        }
                    }
                }
            }

            return false;
        },
        ">=": (field, fieldValue, fieldLength, acceptableValues) => {
            for (let acceptableValue of acceptableValues)
            {
                if (fieldLength == 0)
                {
        
                    if (isDecimal(fieldValue) && isDecimal(acceptableValue))
                    { 
                        if (parseFloat(fieldValue) >= parseFloat(acceptableValue)) 
                        {
                            return true;
                        }
                    }	
                }
                else
                {
                    for (var k = 0; k < fieldLength; k++)
                    {
                                            
                        if (field[k].checked)
                        {
                            if (v_displayvalflag == 1)
                            {
                                fieldValue = field[k].id;
                            }
                            else
                            {
                                fieldValue = field[k].value;
                            }
    
    
                            if (isDecimal(fieldValue) && isDecimal(acceptableValue))
                            { 
                                if (parseFloat(fieldValue) >= parseFloat(acceptableValue)) 
                                {
                                    return true;
                                }
                            }																	
                        }
                    }
                }
            }

            return false;
        },
        "<=": (field, fieldValue, fieldLength, acceptableValues) => {
            for (let acceptableValue of acceptableValues)
            {
                if (fieldLength == 0)
                {
                    if(isDecimal(fieldValue) && isDecimal(acceptableValue))
                    { 
                        if (parseFloat(fieldValue) <= parseFloat(acceptableValue)) 
                        {
                            return true;
                        }
                    }		
                }
                else
                {
                    for (var k = 0; k < fieldLength; k++)
                    {
                                            
                        if (field[k].checked)
                        {
                            if (v_displayvalflag == 1)
                            {
                                fieldValue = field[k].id;
                            }
                            else
                            {
                                fieldValue = field[k].value;
                            }
    
    
                            if (isDecimal(fieldValue) && isDecimal(acceptableValue))
                            { 
                                if (parseFloat(fieldValue) <= parseFloat(acceptableValue)) 
                                {
                                    return true;
                                }
                            }																	
                        }
                    }
                }
            }

            return false;
        },
        "null": (field, fieldValue, fieldLength, acceptableValues) => {
            fieldValue = fieldValue.toLowerCase();
            
            if ((fieldLength == 0 && isEmpty(fieldValue)) || (field.type == 'select-one' && fieldValue == 'select an option'))
            {
                return true;
            }  
            else if (fieldLength > 0 && field.type != 'select-one')
            {
                var chkcount = 0;
                    
                for (var k = 0; k < fieldLength; k++)
                {
                    if (field[k].checked)
                    {
                        chkcount += 1;
                    }
                }
                
                if (chkcount == 0)
                {
                    return true;
                }
            }

            return false;
        },
        "not null": (field, fieldValue, fieldLength, acceptableValues) => {
            return !conditions["null"](field, fieldValue, fieldLength, acceptableValues);
        },
    };

    actions =
    {
        "read only": (fields, isReadOnly) => {
            for (let field of fields)
            {
                if (field.length == undefined)	
                { 
                    field.readOnly =  isReadOnly;

                    if ((field.className.length != 0) && field.className.indexOf('datefield') >= 0)
                    {
                        /*	Added for VEL-202 Bugzilla Id-21678 
                        Start */
                        if (isReadOnly) $j(field).datepicker("destroy");
                        /*End 
                        disableCal(fld);
                        $j('#'+fld).attr("readonly", true);*/
                    }
                    else
                    {		
                        field.className = isReadOnly ? 'inpDefault' : '';
                    }
                    
                }
                else if (field.type == 'select-one')
                {
                    $(field).disabled = isReadOnly;
                    field.readOnly =  isReadOnly;
                    field.className = isReadOnly ? 'inpDefault' : '';
                }
                else if (field[0].type == 'radio' || field[0].type == "checkbox")
                {
                    $(field).forEach((ele) => 
                    {
                            ele.disabled = isReadOnly;
                            ele.readOnly = isReadOnly;
                            ele.className = isReadOnly ? 'inpDefault' : '';
                    });
                }
                else
                {
                    for (var k = 0; k < field.length; k++)
                    {  
                        field[k].readOnly =  isReadOnly;
                        let className = field[k].className;

                        if ((className.length != 0) && className.indexOf('datefield') >= 0 )
                        {
                            /*	Added for VEL-202 Bugzilla Id-21678 
                            Start */
                            if (isReadOnly) $j(field[k]).datepicker("destroy");
                                //End
                            //disableCal(fld[k]);
                            //$j('#'+fld[k]).attr("readonly", true);
                        }
                        else
                        {
                            field[k].className = isReadOnly ? 'inpDefault' : '';
                        }                         
                    }
                }
            }
        },
        "disable": (fields, isDisabled) => {
            for (let field of fields)
            {
                if (field.length == undefined || field.type == 'select-one')	
                {		
                    field.disabled =  isDisabled;

                    if ((field.className.length != 0) && field.className.indexOf('datefield') >= 0)
                    {
                        field.className = isDisabled ? 'datefield inpGrey' : 'datefield';
                    }
                    else field.className = isDisabled ? 'inpGrey' : 'inpDefault';				
                }
                else
                {
                    for (var k = 0; k < field.length; k++)
                    {
                        field[k].disabled =  isDisabled;

                        if ((field[k].className.length != 0) && field[k].className.indexOf('datefield') >= 0)
                            field[k].className= isDisabled ? 'datefield inpGrey' : 'datefield';
                        else
                            field[k].className = isDisabled ? 'inpGrey' : 'inpDefault';
                    }
    
                }
            }
        },
        "hide": (fields, isHidden) => {
            for (let field of fields)
            {
                if (field.length == undefined)	
                {		
                    field.disabled =  isHidden;

                    if ((field.className.length != 0) && field.className.indexOf('datefield') >= 0)
                    {
                        field.className = isHidden ? 'datefield inpGrey' : 'datefield';
                    }
                    else field.className = isHidden ? 'inpGrey' : 'inpDefault';		
                    
                    labelObj = document.getElementById(field.name + "_id");
                    
                    if (field.type == 'textarea')
                    {
                        spanObj = document.getElementById(field.name);
                        tableObj = "#"+field.name+"_id";
                    }
                    else
                    {
                        spanObj = document.getElementById(field.name + "_span");
                        tableObj = "#"+field.name+"_id";
                    } 
                }
                else
                {
                    if (field.length >=1)
                    {
                        if (field.type == 'select-one')
                        {
                            for (var k = 0; k < field.length; k++)
                            {	
                                field[k].disabled =  isHidden;

                                if ((field[k].className.length != 0) && field[k].className.indexOf('datefield') >= 0)
                                {
                                    field[k].className= isHidden ? 'datefield inpGrey' : 'datefield';
                                }
                                else field[k].className = isHidden ? 'inpGrey' : 'inpDefault';
                            }

                            labelObj = document.getElementById(field.name + "_id");
                            spanObj = document.getElementById(field.name + "_span");
                            tableObj = "#"+field.name+"_id";
                        }
                        else
                        {
                            for (var k = 0; k < field.length; k++)
                            {		
                                field[k].disabled =  isHidden;
                                if ((field[k].className.length != 0) && field[k].className.indexOf('datefield') >= 0)
                                {
                                    field[k].className = isHidden ? 'datefield inpGrey' : 'datefield';
                                }
                                else field[k].className = isHidden ? 'inpGrey' : 'inpDefault';
                            }

                            labelObj = document.getElementById(field[0].name + "_id");
                            spanObj = document.getElementById(field[0].name + "_span");
                            tableObj = "#"+field[0].name+"_id";
                        }
                    }
                    else
                    {

                        labelObj = document.getElementById(field.name + "_id");
                        spanObj = document.getElementById(field.name + "_span");
                        tableObj = "#"+field.name+"_id";
                    }
                }
                
                if (labelObj != undefined)
                {
                    labelObj.style.display = isHidden ? "none" : "block";
                }
                
                if (spanObj != undefined)
                {
                    spanObj.style.display = isHidden ? "none" : "block";

                    if (isHidden)
                    {
                        if($j(labelObj).closest("tr").children('td').length<=2)
                        {
                            $j(spanObj).closest("tr").css( "display", "none" );
                            $j(tableObj).closest("table").css( "display", "none" );
                        }
                        else
                        {
                            if($j(spanObj).find('input:checkbox').length>0)
                                $j(spanObj).closest("table").closest("td").css( "display", "none" );
                            else if($j(spanObj).find('input:radio').length>0)
                                $j(spanObj).closest("table").closest("td").css( "display", "none" );
                            else
                                $j(spanObj).closest("td").css( "display", "none" );
                            $j(tableObj).closest("td").css( "display", "none" );
                        } 
                    }
                    else
                    {
                        if($j(labelObj).closest("tr").children('td').length<=2)
                        {
                            $j(spanObj).closest("tr").removeAttr("style");
                            $j(tableObj).closest("table").removeAttr("style");
                        }
                        else
                        {
                            if($j(spanObj).find('input:checkbox').length>0)
                                $j(spanObj).closest("table").closest("td").removeAttr("style");
                            else if($j(spanObj).find('input:radio').length>0)
                                $j(spanObj).closest("table").closest("td").removeAttr("style");
                            else
                                $j(spanObj).closest("td").removeAttr("style");
                            $j(tableObj).closest("td").removeAttr("style");
                        }
                    }
                }
            }
        },
        "highlight": (fields) => {
            for (let field of fields)
            {
                // TODO: fill out this
            }
        }
    }
    

    function conditionCheck(condition)
    {
        let data = condition.data;

        if (condition.type == "single")
        {
            let { fieldValue, fieldLength } = getFieldInfo(data.field);

            let meetsCondition = conditions[data.type](data.field, fieldValue, fieldLength, data.values);

            return meetsCondition;
        }
        else if (condition.type == "multiple")
        {
            if (condition.condition == "or")
            {
                // or condition, any one of subconditions being true results in the whole block returning true
                // therefore, we loop through each one, and if it returns true, we return true
                for (let nestedCondition of condition.data)
                {
                    let valid = conditionCheck(nestedCondition);

                    if (valid) return true;
                }

                return false;
            }
            else if (condition.condition == "and")
            {
                // and condition, all subconditions must be true for the whole block to be true
                // therefore, we loop through each one, and if any are false, we return false
                for (let nestedCondition of condition.data)
                {
                    let valid = conditionCheck(nestedCondition);

                    if (!valid) return false;
                }

                return true;
            }
        }
    }

    let valid = conditionCheck(conditionObject);

    for (let action of actionObject)
    {
        // each action has a type and an array of fields to effect
        actions[action.type](action.fields, valid);
    }


    // For Bug#17234
    if (typeof openCal !== typeof undefined) {  // Safety check to make sure formjs.js can resolve the function
        openCal();  // Defined in jqueryUtils.jsp
    }
}	



function getFieldInfo(field)
{
    let fieldValue = "";
    let fieldLength = 0;

    // set field value and length variables, depends on field type
    if (field.type == 'select-one')
    {
        // honestly unsure what v_displayvalflag is, some velos variable
        if (v_displayvalflag == 1)
        {
            fieldValue = field.options[field.selectedIndex].text;
        }
        else
        {
            fieldValue = field.options[field.selectedIndex].value;
        }
    }
    else if (field.type == undefined)
    {
        fieldLength = field.length;
    }	
    else
    {
        fieldValue = field.value;
    }

    // handle settings field text and length variables for checkbox and radio fields
    if (field.type == 'checkbox' || field.type == 'radio')
    {
        fieldLength =  field.length;

        if (fieldLength == undefined)
        {
            fieldLength = 0;

            if (field.checked)
            {
                if (v_displayvalflag == 1)
                {
                    fieldValue = field.id;
                }
                else
                {
                    fieldValue = field.value;
                }	
            }
            else
            {
                fieldValue = '';
            }
        }
    }

    return { fieldValue, fieldLength };
}