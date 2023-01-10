t('apply');

t(`apply`);

t('save.completed');

t(
  'aaaaaaaaaa.bbbbbbbbb.ccccccccc.ddddddddd.eeeeeeee.fffffffffff.gggggggggggg.hhhhhhhhhhhh.iiiiiiiiiii',
);

console.log(
  t(
    'aaaaaaaaaa.bbbbbbbbb.ccccccccc.ddddddddd.eeeeeeee.fffffffffff.gggggggggggg.hhhhhhhhhhhh.iiiiiiiiiii',
  ),
);

t('accounting.rule', {
  asset: 1 + 2,
  liabilities: 1,
  equity: 2,
});

console.log(t('yes'), t('no'));
const foo = 'foo';

t('common:apply');

t('foo:bar:apply');

t('next.line');

t('under_line');

t('hyphen-hyphen');
