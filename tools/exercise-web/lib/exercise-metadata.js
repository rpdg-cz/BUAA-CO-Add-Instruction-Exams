'use strict';

const DEFAULT_PROBLEM_BASE_URL = 'http://cscore.buaa.edu.cn/#/problem';

function stageOf(id) {
  if (/^Pre_/i.test(id)) return 'Pre';
  return /^(P\d+(?:-P\d+)?)_/.exec(id)?.[1] || 'P?';
}

function compareExercises(a, b) {
  function key(id) {
    const stage = stageOf(id);
    return [stage === 'Pre' ? -1 : Number(/^P(\d+)/.exec(stage)?.[1] ?? Infinity), Number(/_L(\d+)/.exec(id)?.[1] ?? Infinity)];
  }
  const left = key(a.id), right = key(b.id);
  return left[0] - right[0] || left[1] - right[1] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function parseStatementSource(statement, id) {
  const text = String(statement || '');
  const project = /项目\s*[：:]\s*([^\s｜|]+)/.exec(text)?.[1] || stageOf(id);
  const type = /类型\s*[：:]\s*([^\s｜|]+)/.exec(text)?.[1] || null;
  const year = /年份\s*[：:]\s*((?:19|20)\d{2})/.exec(text)?.[1] || /_((?:19|20)\d{2})_blog$/.exec(id)?.[1] || null;
  if (id.endsWith('_blog')) {
    const linked = /来源\s*[：:]\s*\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/.exec(text);
    return {
      kind: 'blog', provenance: /博主自拟/.test(type || '') ? 'proposal' : 'recollection', project, year, type, author: linked?.[1] || null,
      url: linked?.[2] || /原始链接\s*[：:]\s*(https?:\/\/\S+)/.exec(text)?.[1] || null,
      problemId: null, pieId: null,
    };
  }
  const problemId = Number(/题目\s*ID\s*[：:]\s*(\d+)/i.exec(text)?.[1]) || null;
  const pieId = Number(/来源\s*PieId\s*[：:]\s*(\d+)/i.exec(text)?.[1]) || null;
  const base = process.env.CO_PROBLEM_BASE_URL || DEFAULT_PROBLEM_BASE_URL;
  return {
    kind: 'course', project, year, type, problemId, pieId,
    url: problemId ? `${base}?ProblemId=${problemId}${pieId ? `&PieId=${pieId}` : ''}` : null,
  };
}

module.exports = { stageOf, compareExercises, parseStatementSource };
