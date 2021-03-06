# ===========================================================================
# Project:   Abbot - SproutCore Build Tools
# Copyright: ©2011 Strobe Inc.
#            and contributors
# ===========================================================================

require "sproutcore/builders/base"
require "fileutils"
require "json"

module SC

  class Builder::Handlebars < Builder::Base

    def readlines(src_path)
      if File.exist?(src_path) && !File.directory?(src_path)
        File.read(src_path)
      else
        ""
      end
    end

    def build(dst_path)
      template_name = entry.rootname[/^.*\/([^\/]*)$/, 1]
      template_code = readlines(entry[:source_path])
      replace_static_url(template_code)
      writelines dst_path, "SC.TEMPLATES[#{template_name.inspect}] = SC.Handlebars.compile(#{template_code.to_json});"
    end

    def sc_static_match
      /\{\{(sc_static|static_url|sc_target)\(\s*['"]([^"']*?)['"]\s*\)\}\}/
    end

    def static_url(url='')
      url
    end

  end

end

