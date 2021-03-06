$(function()
{
  var loc = window.location;

  if (loc.search.length || loc.href.indexOf('?') !== -1)
  {
    $('#showApp a').attr(
      'href', '/#' + decodeURIComponent(loc.search.substr(1))
    );
  }
  else
  {
    $('#toolbar').addClass('noAppLink');
  }

  if (loc.hostname === 'localhost')
  {
    $(document.body).addClass('touchEnabled');
  }

  var helpContainerEl = $('#helpContainer');
  var currentPage = 1;

  function buildToc(tocEl, sections, level)
  {
    sections.each(function()
    {
      var sectionEl = $(this);

      if (sectionEl.hasClass('todo'))
      {
        return;
      }

      var sectionId = sectionEl.attr('id');
      var sectionName = sectionEl.find('h1').first().contents()[0].nodeValue;

      if (sectionEl.hasClass('pbb'))
      {
        var sectionPage = parseInt(sectionEl.attr('data-page'));

        if (isNaN(sectionPage))
        {
          currentPage += 1;
        }
        else
        {
          currentPage = sectionPage;
        }
      }
      else
      {
        var pbbEl = sectionEl.find('.pbb').first();

        if (pbbEl.closest('section')[0] === sectionEl[0])
        {
          currentPage += 1;
        }
      }

      var sectionLiEl = $('<li><a href="#' + sectionId + '"><span class="sectionName">' + sectionName + '</span> <span class="pageNumber">' + currentPage + '</span></a></li>');

      tocEl.append(sectionLiEl);

      var subsections = sectionEl.children('section');

      if (subsections.length)
      {
        var subsectionsOlEl = $('<ol></ol>').appendTo(sectionLiEl);

        buildToc(subsectionsOlEl, subsections, level + 1);
      }
    });
  }

  buildToc($('#toc ol').first().empty(), helpContainerEl.children('section'), 0);

  $('.privilege').attr('title', 'Wymagane uprawnienia');

  var tooltips = [];

  $('[data-tooltip]').each(function()
  {
    var el = $(this);

    var options = el.attr('data-tooltip').split(',');
    var at = $.trim(options[0]);
    var my = $.trim(options[1]);

    var tooltipEl = $('<p class="tooltip">' + el.attr('title') + '</p>').appendTo(document.body);

    el.attr('title', '');

    tooltips.push(function()
    {
      tooltipEl.position({
        at: at,
        my: my,
        of: el,
        collision: 'none none'
      });
    });

    tooltips[tooltips.length - 1]();
  });

  $(window).resize(function()
  {
    for (var i = 0, l = tooltips.length; i < l; ++i)
    {
      tooltips[i]();
    }
  });

  $('#back').click(function()
  {
    window.history.back();
  });
  $('#forward').click(function()
  {
    window.history.forward();
  });

  var scrollTimer;
  var scrollMulTimer;

  function startScrolling(dir)
  {
    var by = 20 * dir;

    function scroll()
    {
      window.scrollBy(0, by);

      scrollTimer = setTimeout(function()
      {
        if (scrollTimer)
        {
          scroll();
        }
      }, 1000 / 60);
    }

    function scrollMul()
    {
      by *= 1.1;

      if (by > 150)
      {
        by = 150;
        scrollMul = null;
      }
      else
      {
        scrollMulTimer = setTimeout(scrollMul, 333);
      }
    }

    scroll();
    scrollMul();
  }

  function stopScrolling()
  {
    clearTimeout(scrollTimer);
    clearTimeout(scrollMulTimer);

    scrollTimer = null;
    scrollMulTimer = null;
  }

  $('#up').mousedown(function() { startScrolling(-1); });
  $('#up').mouseup(function() { stopScrolling(); });
  $('#up').mouseout(function() { stopScrolling(); });

  $('#down').mousedown(function() { startScrolling(1); });
  $('#down').mouseup(function() { stopScrolling(); });
  $('#down').mouseout(function() { stopScrolling(); });
});
