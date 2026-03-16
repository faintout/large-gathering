/**
 * 将MapboxGL表达式转换为可执行的JS代码字符串  todo 暂时是简单的
 * @param {Array} expression - MapboxGL表达式数组
 * @returns {String} 可执行的JS函数代码字符串
 */
const transformExpression = (expression) => {
  const OPERATORS = {
    '+': {
      initial: 0,
      reduce: (a, b) => a + b,
      direct: (operands) => operands.join(' + ')
    },
    '-': {
      initial: null, // 动态计算
      reduce: (operands) => operands.length === 1
        ? -operands[0]
        : operands.slice(1).reduce((a, b) => a - b, operands[0]),
      direct: (operands) => operands.length === 1
        ? `-${operands[0]}`
        : operands.join(' - ')
    },
    '*': {
      initial: 1,
      reduce: (a, b) => a * b,
      direct: (operands) => operands.join(' * ')
    },
    '/': {
      initial: null, // 动态计算
      reduce: (operands) => operands.slice(1).reduce((a, b) => a / b, operands[0]),
      direct: (operands) => operands.join(' / ')
    }
  };

  const compileNode = (node) => {
    if (!Array.isArray(node)) return JSON.stringify(node);

    const [operator, ...operands] = node;
    if (operator === 'get') return `item.${operands[0]}`;

    if (OPERATORS[operator]) {
      const compiled = operands.map(op =>
        Array.isArray(op) ? `(${compileNode(op)})` : JSON.stringify(op)
      );
      return OPERATORS[operator].direct(compiled);
    }

    throw new Error(`Unsupported operator: ${operator}`);
  };

  const [operator, ...operands] = expression;
  const config = OPERATORS[operator];

  if (config.initial !== null) {
    return `function(data) {
            return data.reduce((sum, item) => {
                return sum ${operator} (${compileNode(operands[0])});
            }, ${config.initial});
        }`;
  } else {
    return `function(data) {
            return data.map(item => ${compileNode(expression)});
        }`;
  }
}
export default transformExpression