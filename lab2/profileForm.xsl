<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:html="http://www.w3.org/1999/xhtml">

    <xsl:template match="/">
        <html>
            <head>
                <title>Profile Form</title>
                <link rel="stylesheet" type="text/css" href="part1.css"/>
            </head>
            <body>
                <div id="profileForm">
                    <form>
                        <xsl:apply-templates select="profileForm/form/field"/>
                        <button type="button">Sign In</button> <!-- Decorative Button -->
                    </form>
                </div>
            </body>
        </html>
    </xsl:template>

    <xsl:template match="field">
        <div class="form-group">
            <label>
                <xsl:value-of select="label"/>
            </label>
            <input>
                <xsl:attribute name="type">
                    <xsl:value-of select="input/@type"/>
                </xsl:attribute>
                <xsl:attribute name="name">
                    <xsl:value-of select="input/@name"/>
                </xsl:attribute>
                <xsl:if test="input/@type='file'">
                    <xsl:attribute name="accept">image/*</xsl:attribute>
                </xsl:if>
            </input>
        </div>
    </xsl:template>

</xsl:stylesheet>
